import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { AppError } from "../middleware/errorHandler";

export const getAllDonors = async (req: Request, res: Response) => {
  const { bloodGroup, location, isEligible } = req.query;

  const donors = await prisma.donor.findMany({
    where: {
      ...(bloodGroup && { bloodGroup: bloodGroup as any }),
      ...(location && { location: { contains: location as string, mode: "insensitive" } }),
      ...(isEligible !== undefined && { isEligible: isEligible === "true" }),
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
    orderBy: { createdAt: "desc" },
  });

  res.json({ status: "success", data: donors });
};

export const getDonorById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const donor = await prisma.donor.findUnique({
    where: { id },
    include: {
      user: true,
      bloodPacks: true,
    },
  });

  if (!donor) {
    throw new AppError("Donor not found", 404);
  }

  res.json({ status: "success", data: donor });
};

export const createDonor = async (req: Request, res: Response) => {
  const { userId, bloodGroup, location, city, address, dateOfBirth, weight, latitude, longitude } = req.body;

  const existingDonor = await prisma.donor.findUnique({
    where: { userId },
  });

  if (existingDonor) {
    throw new AppError("Donor profile already exists for this user", 400);
  }

  // Create donor profile
  const donor = await prisma.donor.create({
    data: {
      userId,
      bloodGroup,
      location,
      city,
      address,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      weight,
      latitude,
      longitude,
    },
    include: {
      user: true,
    },
  });

  // Mark user as verified after completing donor profile
  await prisma.user.update({
    where: { id: userId },
    data: { isVerified: true },
  });

  res.status(201).json({ 
    status: "success", 
    message: "Donor profile completed successfully",
    data: donor 
  });
};

export const updateDonor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const donor = await prisma.donor.update({
    where: { id },
    data: updateData,
    include: {
      user: true,
    },
  });

  res.json({ status: "success", data: donor });
};

export const deleteDonor = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.donor.delete({
    where: { id },
  });

  res.json({ status: "success", message: "Donor deleted successfully" });
};
