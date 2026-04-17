import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { AppError } from "../middleware/errorHandler";

export const getAllDonations = async (req: Request, res: Response) => {
  const { bloodGroup, donationType, status } = req.query;

  const donations = await prisma.donation.findMany({
    where: {
      ...(bloodGroup && { bloodGroup: bloodGroup as any }),
      ...(donationType && { donationType: donationType as any }),
      ...(status && { status: status as any }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: { donationDate: "desc" },
  });

  res.json({ status: "success", data: donations });
};

export const getDonationById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const donation = await prisma.donation.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });

  if (!donation) {
    throw new AppError("Donation not found", 404);
  }

  res.json({ status: "success", data: donation });
};

export const createDonation = async (req: Request, res: Response) => {
  const {
    userId,
    bloodGroup,
    units,
    location,
    donationType,
    status,
    notes,
    contact,
  } = req.body;

  const donation = await prisma.donation.create({
    data: {
      userId,
      bloodGroup,
      units: units || 1,
      location,
      donationType: donationType || "PERSON",
      status: status || "COMPLETED",
      notes,
      contact,
    },
    include: {
      user: true,
    },
  });

  // Update donor's last donation date and total donations
  const donor = await prisma.donor.findUnique({
    where: { userId },
  });

  if (donor) {
    await prisma.donor.update({
      where: { id: donor.id },
      data: {
        lastDonationDate: new Date(),
        totalDonations: { increment: 1 },
      },
    });
  }

  res.status(201).json({ status: "success", data: donation });
};

export const updateDonation = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const donation = await prisma.donation.update({
    where: { id },
    data: updateData,
    include: {
      user: true,
    },
  });

  res.json({ status: "success", data: donation });
};

export const deleteDonation = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.donation.delete({
    where: { id },
  });

  res.json({ status: "success", message: "Donation deleted successfully" });
};

// Blood Collection - Creates donation record and blood pack
export const recordBloodCollection = async (req: Request, res: Response) => {
  const {
    donorId,
    donorName,
    donorPhone,
    donorEmail,
    bloodGroup,
    location,
    units,
    collectionDate,
    collectionLocation,
    storageLocation,
    notes,
  } = req.body;

  // Validate required fields
  if (!donorName || !donorPhone || !bloodGroup || !collectionDate) {
    throw new AppError("Missing required fields", 400);
  }

  // Convert blood group format (A+ -> A_POSITIVE)
  const bloodGroupMap: Record<string, string> = {
    'A+': 'A_POSITIVE',
    'A-': 'A_NEGATIVE',
    'B+': 'B_POSITIVE',
    'B-': 'B_NEGATIVE',
    'AB+': 'AB_POSITIVE',
    'AB-': 'AB_NEGATIVE',
    'O+': 'O_POSITIVE',
    'O-': 'O_NEGATIVE',
  };

  const dbBloodGroup = bloodGroupMap[bloodGroup] || bloodGroup;

  // Start transaction
  const result = await prisma.$transaction(async (tx) => {
    let donor = null;
    let userId = null;

    // If donorId provided, get existing donor
    if (donorId) {
      donor = await tx.donor.findUnique({
        where: { id: donorId },
        include: { user: true },
      });

      if (donor) {
        userId = donor.userId;
        
        // Update donor's donation count and last donation date
        await tx.donor.update({
          where: { id: donorId },
          data: {
            lastDonationDate: new Date(collectionDate),
            totalDonations: { increment: parseInt(units) || 1 },
          },
        });
      }
    }

    // If no donor found, create a temporary user and donor record
    if (!userId) {
      // Check if user with this phone already exists
      let user = await tx.user.findFirst({
        where: { phone: donorPhone },
      });

      if (!user) {
        // Create new user (walk-in donor)
        user = await tx.user.create({
          data: {
            name: donorName,
            phone: donorPhone,
            email: donorEmail || `${donorPhone}@walkin.local`,
            password: 'WALK_IN_DONOR', // Placeholder password
            role: 'DONOR',
            isVerified: false, // Walk-in donors are not verified web users
          },
        });
      }

      userId = user.id;

      // Check if donor profile exists
      donor = await tx.donor.findUnique({
        where: { userId },
      });

      if (!donor) {
        // Create donor profile
        donor = await tx.donor.create({
          data: {
            userId,
            bloodGroup: dbBloodGroup as any,
            location: location || collectionLocation || 'Unknown',
            totalDonations: parseInt(units) || 1,
            lastDonationDate: new Date(collectionDate),
          },
        });
      } else {
        // Update existing donor
        await tx.donor.update({
          where: { id: donor.id },
          data: {
            lastDonationDate: new Date(collectionDate),
            totalDonations: { increment: parseInt(units) || 1 },
          },
        });
      }
    }

    // Create donation record
    const donation = await tx.donation.create({
      data: {
        userId,
        donorId: donor?.id,
        bloodGroup: dbBloodGroup as any,
        units: parseInt(units) || 1,
        donationDate: new Date(collectionDate),
        location: collectionLocation,
        donationType: 'PERSON',
        status: 'COMPLETED',
        notes,
        contact: donorPhone,
      },
    });

    // Generate blood pack code (BP-YYYY-NNN)
    const year = new Date(collectionDate).getFullYear();
    const lastPack = await tx.bloodPack.findFirst({
      where: {
        packCode: {
          startsWith: `BP-${year}-`,
        },
      },
      orderBy: { packCode: 'desc' },
    });

    let packNumber = 1;
    if (lastPack) {
      const lastNumber = parseInt(lastPack.packCode.split('-')[2]);
      packNumber = lastNumber + 1;
    }

    const packCode = `BP-${year}-${packNumber.toString().padStart(3, '0')}`;

    // Calculate expiry date (collection date + 35 days)
    const expiryDate = new Date(collectionDate);
    expiryDate.setDate(expiryDate.getDate() + 35);

    // Create blood pack
    const bloodPack = await tx.bloodPack.create({
      data: {
        packCode,
        bloodGroup: dbBloodGroup as any,
        donorId: donor?.id,
        collectionDate: new Date(collectionDate),
        expiryDate,
        status: 'AVAILABLE',
        storageLocation: storageLocation || 'Main Storage',
      },
    });

    // Update blood stock summary
    const stockSummary = await tx.bloodStockSummary.findUnique({
      where: { bloodGroup: dbBloodGroup as any },
    });

    if (stockSummary) {
      await tx.bloodStockSummary.update({
        where: { bloodGroup: dbBloodGroup as any },
        data: {
          available: { increment: parseInt(units) || 1 },
          total: { increment: parseInt(units) || 1 },
          lastUpdated: new Date(),
        },
      });
    } else {
      await tx.bloodStockSummary.create({
        data: {
          bloodGroup: dbBloodGroup as any,
          available: parseInt(units) || 1,
          total: parseInt(units) || 1,
          used: 0,
          expired: 0,
          lastUpdated: new Date(),
        },
      });
    }

    return { donation, bloodPack, donor };
  });

  res.status(201).json({
    status: "success",
    message: "Blood collection recorded successfully",
    data: result,
  });
};

// Search donors by name, phone, or email
export const searchDonors = async (req: Request, res: Response) => {
  const { query } = req.query;

  if (!query || typeof query !== 'string') {
    throw new AppError("Search query is required", 400);
  }

  const donors = await prisma.donor.findMany({
    where: {
      OR: [
        {
          user: {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
        },
        {
          user: {
            phone: {
              contains: query,
            },
          },
        },
        {
          user: {
            email: {
              contains: query,
              mode: 'insensitive',
            },
          },
        },
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isVerified: true,
        },
      },
    },
    take: 10, // Limit results
    orderBy: { totalDonations: 'desc' },
  });

  res.json({ status: "success", data: donors });
};
