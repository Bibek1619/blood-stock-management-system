import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { AppError } from "../middleware/errorHandler";

export const getAllCertificates = async (req: Request, res: Response) => {
  const { type, userId } = req.query;

  const certificates = await prisma.certificate.findMany({
    where: {
      ...(type && { type: type as any }),
      ...(userId && { userId: userId as string }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { issueDate: "desc" },
  });

  res.json({ status: "success", data: certificates });
};

export const getCertificateById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const certificate = await prisma.certificate.findUnique({
    where: { id: id as string },
    include: {
      user: true,
    },
  });

  if (!certificate) {
    throw new AppError("Certificate not found", 404);
  }

  res.json({ status: "success", data: certificate });
};

export const getCertificateByNumber = async (req: Request, res: Response) => {
  const { certificateNumber } = req.params;

  const certificate = await prisma.certificate.findUnique({
    where: { certificateNumber: certificateNumber as string },
    include: {
      user: true,
    },
  });

  if (!certificate) {
    throw new AppError("Certificate not found", 404);
  }

  res.json({ status: "success", data: certificate });
};

export const createCertificate = async (req: Request, res: Response) => {
  try {
    const {
      certificateNumber,
      type,
      userId,
      recipientName,
      eventTitle,
      volunteerId,
    } = req.body;

    // Validate required fields
    if (!certificateNumber) {
      throw new AppError("Certificate number is required", 400);
    }
    if (!userId) {
      throw new AppError("User ID is required", 400);
    }
    if (!recipientName) {
      throw new AppError("Recipient name is required", 400);
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new AppError("User not found. Please select a valid recipient.", 400);
    }

    // Check if certificate number already exists
    const existingCertificate = await prisma.certificate.findUnique({
      where: { certificateNumber },
    });

    if (existingCertificate) {
      throw new AppError("Certificate with this number already exists", 400);
    }

    // Create certificate
    const certificate = await prisma.certificate.create({
      data: {
        certificateNumber,
        type: type || "DONATION",
        userId,
        recipientName,
        eventTitle,
        volunteerId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({ status: "success", data: certificate });
  } catch (error: any) {
    console.error("Certificate creation error:", error);
    
    // Handle Prisma specific errors
    if (error.code === 'P2002') {
      throw new AppError("Certificate number must be unique", 400);
    }
    if (error.code === 'P2003') {
      throw new AppError("Invalid user reference. Please select a valid recipient.", 400);
    }
    if (error.code === 'P2025') {
      throw new AppError("User not found", 404);
    }
    
    // Re-throw AppError instances
    if (error instanceof AppError) {
      throw error;
    }
    
    // Handle unexpected errors
    throw new AppError("Failed to create certificate: " + error.message, 500);
  }
};

export const deleteCertificate = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.certificate.delete({
    where: { id: id as string },
  });

  res.json({ status: "success", message: "Certificate deleted successfully" });
};
