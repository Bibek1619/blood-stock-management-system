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
    where: { id },
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
    where: { certificateNumber },
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
  const {
    certificateNumber,
    type,
    userId,
    recipientName,
    eventTitle,
    volunteerId,
  } = req.body;

  const existingCertificate = await prisma.certificate.findUnique({
    where: { certificateNumber },
  });

  if (existingCertificate) {
    throw new AppError("Certificate with this number already exists", 400);
  }

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
      user: true,
    },
  });

  res.status(201).json({ status: "success", data: certificate });
};

export const deleteCertificate = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.certificate.delete({
    where: { id },
  });

  res.json({ status: "success", message: "Certificate deleted successfully" });
};
