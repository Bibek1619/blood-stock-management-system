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
