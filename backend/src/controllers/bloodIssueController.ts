import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { AppError } from "../middleware/errorHandler";

export const getAllBloodIssues = async (req: Request, res: Response) => {
  const { bloodGroup, recipientType, status } = req.query;

  const bloodIssues = await prisma.bloodIssue.findMany({
    where: {
      ...(bloodGroup && { bloodGroup: bloodGroup as any }),
      ...(recipientType && { recipientType: recipientType as any }),
      ...(status && { status: status as any }),
    },
    include: {
      bloodPacksIssued: {
        include: {
          bloodPack: true,
        },
      },
    },
    orderBy: { issueDate: "desc" },
  });

  res.json({ status: "success", data: bloodIssues });
};

export const getBloodIssueById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const bloodIssue = await prisma.bloodIssue.findUnique({
    where: { id: id as string },
    include: {
      bloodPacksIssued: {
        include: {
          bloodPack: true,
        },
      },
    },
  });

  if (!bloodIssue) {
    throw new AppError("Blood issue record not found", 404);
  }

  res.json({ status: "success", data: bloodIssue });
};

export const createBloodIssue = async (req: Request, res: Response) => {
  const {
    issueCode,
    recipientName,
    recipientType,
    bloodGroup,
    unitsRequested,
    contact,
    issuedBy,
    bloodPackIds,
    notes,
  } = req.body;

  // Check if blood packs are available
  const availablePacks = await prisma.bloodPack.findMany({
    where: {
      id: { in: bloodPackIds },
      status: "AVAILABLE",
      bloodGroup,
    },
  });

  if (availablePacks.length < bloodPackIds.length) {
    throw new AppError("Some blood packs are not available", 400);
  }

  // Create blood issue
  const bloodIssue = await prisma.bloodIssue.create({
    data: {
      issueCode,
      recipientName,
      recipientType: recipientType || "PERSON",
      bloodGroup,
      unitsRequested,
      unitsIssued: bloodPackIds.length,
      contact,
      issuedBy,
      notes,
      bloodPacksIssued: {
        create: bloodPackIds.map((packId: string) => ({
          bloodPackId: packId,
        })),
      },
    },
    include: {
      bloodPacksIssued: {
        include: {
          bloodPack: true,
        },
      },
    },
  });

  // Update blood pack status to USED
  await prisma.bloodPack.updateMany({
    where: {
      id: { in: bloodPackIds },
    },
    data: {
      status: "USED",
    },
  });

  res.status(201).json({ status: "success", data: bloodIssue });
};

export const updateBloodIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const bloodIssue = await prisma.bloodIssue.update({
    where: { id: id as string },
    data: updateData,
    include: {
      bloodPacksIssued: {
        include: {
          bloodPack: true,
        },
      },
    },
  });

  res.json({ status: "success", data: bloodIssue });
};

export const deleteBloodIssue = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.bloodIssue.delete({
    where: { id: id as string },
  });

  res.json({ status: "success", message: "Blood issue record deleted successfully" });
};
