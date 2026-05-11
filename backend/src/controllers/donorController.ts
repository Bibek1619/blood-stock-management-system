import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { geocodeLocation } from "../utils/geocoding";

export const getAllDonors = async (req: Request, res: Response) => {
  const { bloodGroup, location, isEligible, page = '1', limit = '20' } = req.query;

  // Parse pagination parameters
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause
  const where = {
    ...(bloodGroup && { bloodGroup: bloodGroup as any }),
    ...(location && { location: { contains: location as string, mode: "insensitive" as const } }),
    ...(isEligible !== undefined && { isEligible: isEligible === "true" }),
  };

  // Get total count for pagination
  const total = await prisma.donor.count({ where });

  // Get paginated donors
  const donors = await prisma.donor.findMany({
    where,
    select: {
      id: true,
      userId: true,
      bloodGroup: true,
      donorType: true, // Explicitly include donorType
      location: true,
      city: true,
      address: true,
      dateOfBirth: true,
      weight: true,
      latitude: true,
      longitude: true,
      lastDonationDate: true,
      totalDonations: true,
      isEligible: true,
      createdAt: true,
      updatedAt: true,
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
    skip,
    take: limitNum,
  });

  res.json({ 
    status: "success", 
    data: donors,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    }
  });
};

export const getDonorById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const donor = await prisma.donor.findUnique({
    where: { id: id as string },
    select: {
      id: true,
      userId: true,
      bloodGroup: true,
      donorType: true, // Explicitly include donorType
      location: true,
      city: true,
      address: true,
      dateOfBirth: true,
      weight: true,
      latitude: true,
      longitude: true,
      lastDonationDate: true,
      totalDonations: true,
      isEligible: true,
      createdAt: true,
      updatedAt: true,
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

  // Geocode city if coordinates not provided
  let finalLatitude = latitude;
  let finalLongitude = longitude;

  if (!latitude || !longitude) {
    const cityToGeocode = city || location;
    if (cityToGeocode) {
      const coords = await geocodeLocation(cityToGeocode);
      if (coords) {
        finalLatitude = coords.latitude;
        finalLongitude = coords.longitude;
        console.log(`Geocoded ${cityToGeocode}:`, coords);
      }
    }
  }

  // Create donor profile
  const donor = await prisma.donor.create({
    data: {
      userId,
      bloodGroup,
      donorType: 'PERSON', // Default to PERSON for individual donors
      location,
      city,
      address,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      weight,
      latitude: finalLatitude,
      longitude: finalLongitude,
    },
    select: {
      id: true,
      userId: true,
      bloodGroup: true,
      donorType: true,
      location: true,
      city: true,
      address: true,
      dateOfBirth: true,
      weight: true,
      latitude: true,
      longitude: true,
      lastDonationDate: true,
      totalDonations: true,
      isEligible: true,
      createdAt: true,
      updatedAt: true,
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
    where: { id: id as string },
    data: updateData,
    select: {
      id: true,
      userId: true,
      bloodGroup: true,
      donorType: true,
      location: true,
      city: true,
      address: true,
      dateOfBirth: true,
      weight: true,
      latitude: true,
      longitude: true,
      lastDonationDate: true,
      totalDonations: true,
      isEligible: true,
      createdAt: true,
      updatedAt: true,
      user: true,
    },
  });

  res.json({ status: "success", data: donor });
};

export const deleteDonor = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.donor.delete({
    where: { id: id as string },
  });

  res.json({ status: "success", message: "Donor deleted successfully" });
};
