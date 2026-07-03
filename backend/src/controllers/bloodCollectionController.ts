import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { AppError } from "../middleware/errorHandler";

/**
 * Get all blood collections
 */
export const getBloodCollections = async (req: Request, res: Response) => {
  try {
    console.log('🔍 getBloodCollections called');
    const { status, bloodGroup, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (bloodGroup) where.bloodGroup = bloodGroup;

    console.log('🔍 Querying with where:', where);

    const total = await prisma.bloodCollection.count({ where });
    console.log('🔍 Total count:', total);

    const collections = await prisma.bloodCollection.findMany({
      where,
      include: {
        donor: {
          include: {
            user: {
              select: {
                name: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        bloodTest: true,
      },
      orderBy: { collectionDate: "desc" },
      skip,
      take: limitNum,
    });

    console.log('🔍 Found collections:', collections.length);

    res.json({
      status: "success",
      data: collections,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('❌ getBloodCollections error:', error);
    throw error;
  }
};

/**
 * Get blood collection by ID
 */
export const getBloodCollectionById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const collection = await prisma.bloodCollection.findUnique({
    where: { id: id as string },
    include: {
      donor: {
        include: {
          user: true,
        },
      },
      bloodTest: {
        include: {
          tester: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      bloodStock: true,
    },
  });

  if (!collection) {
    throw new AppError("Blood collection not found", 404);
  }

  res.json({ status: "success", data: collection });
};

/**
 * Create new blood collection
 */
export const createBloodCollection = async (req: Request, res: Response) => {
  const {
    bloodCode,
    donorId,
    donorName,
    bloodGroup,
    quantityMl = 450,
    collectionDate,
    remarks,
  } = req.body;

  // Check if blood code already exists
  const existing = await prisma.bloodCollection.findUnique({
    where: { bloodCode },
  });

  if (existing) {
    throw new AppError("Blood code already exists", 400);
  }

  // If donorId provided, verify donor exists
  if (donorId) {
    const donor = await prisma.donor.findUnique({ where: { id: donorId } });
    if (!donor) {
      throw new AppError("Donor not found", 404);
    }
  }

  const collection = await prisma.bloodCollection.create({
    data: {
      bloodCode,
      donorId,
      donorName,
      bloodGroup,
      quantityMl: parseInt(quantityMl),
      collectionDate: collectionDate ? new Date(collectionDate) : new Date(),
      remarks,
      status: "PENDING",
    },
    include: {
      donor: {
        include: {
          user: true,
        },
      },
    },
  });

  res.status(201).json({
    status: "success",
    message: "Blood collection recorded successfully",
    data: collection,
  });
};

/**
 * Update blood collection status
 */
export const updateBloodCollectionStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, remarks } = req.body;

  const collection = await prisma.bloodCollection.findUnique({
    where: { id: id as string },
  });

  if (!collection) {
    throw new AppError("Blood collection not found", 404);
  }

  const updated = await prisma.bloodCollection.update({
    where: { id: id as string },
    data: {
      status,
      ...(remarks && { remarks }),
    },
    include: {
      donor: {
        include: {
          user: true,
        },
      },
      bloodTest: true,
    },
  });

  res.json({
    status: "success",
    message: "Blood collection status updated",
    data: updated,
  });
};

/**
 * Delete blood collection
 */
export const deleteBloodCollection = async (req: Request, res: Response) => {
  const { id } = req.params;

  const collection = await prisma.bloodCollection.findUnique({
    where: { id: id as string },
    include: {
      bloodStock: true,
    },
  });

  if (!collection) {
    throw new AppError("Blood collection not found", 404);
  }

  // Don't allow deletion if already in stock
  if (collection.bloodStock) {
    throw new AppError("Cannot delete blood collection that is already in stock", 400);
  }

  await prisma.bloodCollection.delete({
    where: { id: id as string },
  });

  res.json({
    status: "success",
    message: "Blood collection deleted successfully",
  });
};

/**
 * Get pending blood collections (for testing)
 */
export const getPendingCollections = async (req: Request, res: Response) => {
  const collections = await prisma.bloodCollection.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      donor: {
        include: {
          user: {
            select: {
              name: true,
              phone: true,
              email: true,
            },
          },
        },
      },
      bloodTest: true,
    },
    orderBy: { collectionDate: "desc" },
  });

  res.json({
    status: "success",
    data: collections,
  });
};

/**
 * Get approved blood collections
 */
export const getApprovedCollections = async (req: Request, res: Response) => {
  const collections = await prisma.bloodCollection.findMany({
    where: {
      status: "APPROVED",
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
      bloodTest: true,
      bloodStock: true,
    },
    orderBy: { collectionDate: "desc" },
  });

  res.json({
    status: "success",
    data: collections,
  });
};

/**
 * Get rejected blood collections
 */
export const getRejectedCollections = async (req: Request, res: Response) => {
  const collections = await prisma.bloodCollection.findMany({
    where: {
      status: "REJECTED",
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
      bloodTest: true,
    },
    orderBy: { collectionDate: "desc" },
  });

  res.json({
    status: "success",
    data: collections,
  });
};
