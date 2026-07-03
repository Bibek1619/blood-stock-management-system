import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { AppError } from "../middleware/errorHandler";

/**
 * Create or update blood test
 */
export const createOrUpdateBloodTest = async (req: Request, res: Response) => {
  const { bloodCollectionId } = req.params;
  const {
    hiv,
    hepatitisB,
    hepatitisC,
    malaria,
    syphilis,
    status,
    description,
  } = req.body;

  // @ts-ignore - user is attached by auth middleware
  const userId = req.user?.id;

  // Verify blood collection exists and is pending
  const collection = await prisma.bloodCollection.findUnique({
    where: { id: bloodCollectionId as string },
  });

  if (!collection) {
    throw new AppError("Blood collection not found", 404);
  }

  // Check if all tests pass
  const allTestsPass = !hiv && !hepatitisB && !hepatitisC && !malaria && !syphilis;
  const finalStatus = status || (allTestsPass ? "APPROVED" : "REJECTED");

  // Create or update blood test
  const bloodTest = await prisma.bloodTest.upsert({
    where: { bloodCollectionId: bloodCollectionId as string },
    update: {
      hiv: hiv === true,
      hepatitisB: hepatitisB === true,
      hepatitisC: hepatitisC === true,
      malaria: malaria === true,
      syphilis: syphilis === true,
      status: finalStatus,
      description,
      testedBy: userId,
      testDate: new Date(),
    },
    create: {
      bloodCollectionId: bloodCollectionId as string,
      hiv: hiv === true,
      hepatitisB: hepatitisB === true,
      hepatitisC: hepatitisC === true,
      malaria: malaria === true,
      syphilis: syphilis === true,
      status: finalStatus,
      description,
      testedBy: userId,
    },
    include: {
      tester: {
        select: {
          name: true,
          email: true,
        },
      },
      bloodCollection: true,
    },
  });

  // Update blood collection status
  await prisma.bloodCollection.update({
    where: { id: bloodCollectionId as string },
    data: {
      status: finalStatus === "APPROVED" ? "APPROVED" : "REJECTED",
    },
  });

  res.json({
    status: "success",
    message: `Blood test ${finalStatus.toLowerCase()} successfully`,
    data: bloodTest,
  });
};

/**
 * Get blood test by collection ID
 */
export const getBloodTestByCollectionId = async (req: Request, res: Response) => {
  const { bloodCollectionId } = req.params;

  const bloodTest = await prisma.bloodTest.findUnique({
    where: { bloodCollectionId: bloodCollectionId as string },
    include: {
      tester: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
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

  if (!bloodTest) {
    throw new AppError("Blood test not found", 404);
  }

  res.json({
    status: "success",
    data: bloodTest,
  });
};

/**
 * Get all blood tests
 */
export const getAllBloodTests = async (req: Request, res: Response) => {
  const { status, page = '1', limit = '20' } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (status) where.status = status;

  const total = await prisma.bloodTest.count({ where });

  const tests = await prisma.bloodTest.findMany({
    where,
    include: {
      tester: {
        select: {
          name: true,
          email: true,
        },
      },
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
    orderBy: { testDate: "desc" },
    skip,
    take: limitNum,
  });

  res.json({
    status: "success",
    data: tests,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};
