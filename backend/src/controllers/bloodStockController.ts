import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { AppError } from "../middleware/errorHandler";

export const getBloodStock = async (req: Request, res: Response) => {
  const { bloodGroup, status } = req.query;

  const bloodPacks = await prisma.bloodPack.findMany({
    where: {
      ...(bloodGroup && { bloodGroup: bloodGroup as any }),
      ...(status && { status: status as any }),
    },
    include: {
      donor: {
        include: {
          user: {
            select: {
              name: true,
              phone: true,
            },
          },
        },
      },
    },
    orderBy: { collectionDate: "desc" },
  });

  res.json({ status: "success", data: bloodPacks });
};

export const getBloodStockSummary = async (req: Request, res: Response) => {
  const summary = await prisma.bloodPack.groupBy({
    by: ["bloodGroup", "status"],
    _count: true,
  });

  const formattedSummary = summary.reduce((acc: any, item) => {
    const group = item.bloodGroup;
    if (!acc[group]) {
      acc[group] = { bloodGroup: group, available: 0, used: 0, expired: 0, total: 0 };
    }
    acc[group][item.status.toLowerCase()] = item._count;
    acc[group].total += item._count;
    return acc;
  }, {});

  res.json({ status: "success", data: Object.values(formattedSummary) });
};

export const getBloodPackById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const bloodPack = await prisma.bloodPack.findUnique({
    where: { id },
    include: {
      donor: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!bloodPack) {
    throw new AppError("Blood pack not found", 404);
  }

  res.json({ status: "success", data: bloodPack });
};

export const createBloodPack = async (req: Request, res: Response) => {
  const {
    packCode,
    bloodGroup,
    donorId,
    collectionDate,
    expiryDate,
    storageLocation,
  } = req.body;

  const existingPack = await prisma.bloodPack.findUnique({
    where: { packCode },
  });

  if (existingPack) {
    throw new AppError("Blood pack with this code already exists", 400);
  }

  const bloodPack = await prisma.bloodPack.create({
    data: {
      packCode,
      bloodGroup,
      donorId,
      collectionDate: new Date(collectionDate),
      expiryDate: new Date(expiryDate),
      storageLocation,
    },
    include: {
      donor: {
        include: {
          user: true,
        },
      },
    },
  });

  res.status(201).json({ status: "success", data: bloodPack });
};

export const updateBloodPack = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const bloodPack = await prisma.bloodPack.update({
    where: { id },
    data: updateData,
    include: {
      donor: {
        include: {
          user: true,
        },
      },
    },
  });

  res.json({ status: "success", data: bloodPack });
};

export const deleteBloodPack = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.bloodPack.delete({
    where: { id },
  });

  res.json({ status: "success", message: "Blood pack deleted successfully" });
};
