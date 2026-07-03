import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { AppError } from "../middleware/errorHandler";

/**
 * Move approved blood to stock
 */
export const moveToStock = async (req: Request, res: Response) => {
  const { bloodCollectionId } = req.body;

  // Verify blood collection exists and is approved
  const collection = await prisma.bloodCollection.findUnique({
    where: { id: bloodCollectionId },
    include: {
      bloodStock: true,
      bloodTest: true,
    },
  });

  if (!collection) {
    throw new AppError("Blood collection not found", 404);
  }

  if (collection.status !== "APPROVED") {
    throw new AppError("Only approved blood can be moved to stock", 400);
  }

  if (collection.bloodStock) {
    throw new AppError("Blood already in stock", 400);
  }

  if (!collection.bloodTest) {
    throw new AppError("Blood must be tested before moving to stock", 400);
  }

  // Calculate expiry date (42 days from collection)
  const expiryDate = new Date(collection.collectionDate);
  expiryDate.setDate(expiryDate.getDate() + 42);

  // Generate blood pack code (BP-YYYY-NNN)
  const year = new Date(collection.collectionDate).getFullYear();
  const lastPack = await prisma.bloodPack.findFirst({
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

  // Create blood stock entry AND blood pack in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create blood pack
    const bloodPack = await tx.bloodPack.create({
      data: {
        packCode,
        bloodGroup: collection.bloodGroup,
        donorId: collection.donorId,
        collectionDate: collection.collectionDate,
        expiryDate,
        status: 'AVAILABLE',
        storageLocation: 'Main Storage',
      },
    });

    // Create blood stock entry
    const bloodStock = await tx.bloodStock.create({
      data: {
        bloodCollectionId: collection.id,
        bloodCode: packCode, // Use the blood pack code
        bloodGroup: collection.bloodGroup,
        quantityMl: collection.quantityMl,
        storedDate: new Date(),
        expiryDate,
        status: "AVAILABLE",
      },
      include: {
        bloodCollection: {
          include: {
            donor: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    // Update blood stock summary
    const stockSummary = await tx.bloodStockSummary.findUnique({
      where: { bloodGroup: collection.bloodGroup },
    });

    if (stockSummary) {
      await tx.bloodStockSummary.update({
        where: { bloodGroup: collection.bloodGroup },
        data: {
          available: { increment: 1 },
          total: { increment: 1 },
          lastUpdated: new Date(),
        },
      });
    } else {
      await tx.bloodStockSummary.create({
        data: {
          bloodGroup: collection.bloodGroup,
          available: 1,
          total: 1,
          used: 0,
          expired: 0,
          lastUpdated: new Date(),
        },
      });
    }

    return { bloodStock, bloodPack };
  });

  res.status(201).json({
    status: "success",
    message: "Blood moved to stock successfully",
    data: result,
  });
};

/**
 * Get all blood stock
 */
export const getBloodStock = async (req: Request, res: Response) => {
  const { bloodGroup, status, page = '1', limit = '20' } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (bloodGroup) where.bloodGroup = bloodGroup;
  if (status) where.status = status;

  const total = await prisma.bloodStock.count({ where });

  const stock = await prisma.bloodStock.findMany({
    where,
    include: {
      bloodCollection: {
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
      },
    },
    orderBy: { storedDate: "desc" },
    skip,
    take: limitNum,
  });

  res.json({
    status: "success",
    data: stock,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};

/**
 * Get blood stock summary
 */
export const getBloodStockSummary = async (req: Request, res: Response) => {
  const summary = await prisma.bloodStock.groupBy({
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

/**
 * Issue blood from stock
 */
export const issueBlood = async (req: Request, res: Response) => {
  const {
    issueCode,
    hospitalName,
    patientName,
    bloodGroup,
    quantityMl,
    bloodStockIds,
    remarks,
  } = req.body;

  // @ts-ignore
  const userId = req.user?.id;

  // Check if issue code already exists
  const existing = await prisma.bloodIssueRecord.findUnique({
    where: { issueCode },
  });

  if (existing) {
    throw new AppError("Issue code already exists", 400);
  }

  // Verify all blood stock items exist and are available
  const stockItems = await prisma.bloodStock.findMany({
    where: {
      id: { in: bloodStockIds },
    },
  });

  if (stockItems.length !== bloodStockIds.length) {
    throw new AppError("Some blood stock items not found", 404);
  }

  const unavailable = stockItems.filter(item => item.status !== "AVAILABLE");
  if (unavailable.length > 0) {
    throw new AppError("Some blood stock items are not available", 400);
  }

  // Calculate total quantity
  const totalQuantity = stockItems.reduce((sum, item) => sum + item.quantityMl, 0);

  if (totalQuantity < quantityMl) {
    throw new AppError("Insufficient blood quantity in selected stock items", 400);
  }

  // Create blood issue record and update stock items in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create issue record
    const issue = await tx.bloodIssueRecord.create({
      data: {
        issueCode,
        hospitalName,
        patientName,
        bloodGroup,
        quantityMl,
        remarks,
      },
    });

    // Create issue items and update stock status
    for (const stockItem of stockItems) {
      await tx.bloodStockIssueItem.create({
        data: {
          bloodIssueId: issue.id,
          bloodStockId: stockItem.id,
          quantityMl: stockItem.quantityMl,
        },
      });

      await tx.bloodStock.update({
        where: { id: stockItem.id },
        data: { status: "USED" },
      });
    }

    return issue;
  });

  // Fetch complete issue record with relations
  const issueRecord = await prisma.bloodIssueRecord.findUnique({
    where: { id: result.id },
    include: {
      bloodStockItems: {
        include: {
          bloodStock: {
            include: {
              bloodCollection: {
                include: {
                  donor: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  res.status(201).json({
    status: "success",
    message: "Blood issued successfully",
    data: issueRecord,
  });
};

/**
 * Get all blood issues
 */
export const getBloodIssues = async (req: Request, res: Response) => {
  const { bloodGroup, page = '1', limit = '20' } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (bloodGroup) where.bloodGroup = bloodGroup;

  const total = await prisma.bloodIssueRecord.count({ where });

  const issues = await prisma.bloodIssueRecord.findMany({
    where,
    include: {
      bloodStockItems: {
        include: {
          bloodStock: {
            include: {
              bloodCollection: {
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
              },
            },
          },
        },
      },
    },
    orderBy: { issueDate: "desc" },
    skip,
    take: limitNum,
  });

  res.json({
    status: "success",
    data: issues,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};

/**
 * Get blood issue by ID
 */
export const getBloodIssueById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const issue = await prisma.bloodIssueRecord.findUnique({
    where: { id: id as string },
    include: {
      bloodStockItems: {
        include: {
          bloodStock: {
            include: {
              bloodCollection: {
                include: {
                  donor: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!issue) {
    throw new AppError("Blood issue record not found", 404);
  }

  res.json({
    status: "success",
    data: issue,
  });
};
