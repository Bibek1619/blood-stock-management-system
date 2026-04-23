import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { AppError } from "../middleware/errorHandler";

export const getAllEvents = async (req: Request, res: Response) => {
  const { status } = req.query;

  const events = await prisma.event.findMany({
    where: {
      ...(status && { status: status as any }),
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      volunteers: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: { eventDate: "desc" },
  });

  res.json({ status: "success", data: events });
};

export const getEventById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      participants: {
        include: {
          user: true,
        },
      },
      volunteers: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  res.json({ status: "success", data: event });
};

export const createEvent = async (req: Request, res: Response) => {
  const { title, description, location, eventDate, capacity } = req.body;

  const event = await prisma.event.create({
    data: {
      title,
      description,
      location,
      eventDate: new Date(eventDate),
      capacity,
    },
  });

  res.status(201).json({ status: "success", data: event });
};

export const updateEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const event = await prisma.event.update({
    where: { id },
    data: updateData,
  });

  res.json({ status: "success", data: event });
};

export const deleteEvent = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.event.delete({
    where: { id },
  });

  res.json({ status: "success", message: "Event deleted successfully" });
};

export const addParticipant = async (req: Request, res: Response) => {
  const { id: eventId } = req.params;
  const { userId } = req.body;

  const existingRegistration = await prisma.eventParticipant.findUnique({
    where: {
      eventId_userId: { eventId, userId },
    },
  });

  if (existingRegistration) {
    throw new AppError("User already registered for this event", 400);
  }

  const participant = await prisma.eventParticipant.create({
    data: {
      eventId,
      userId,
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
  });

  res.status(201).json({ status: "success", data: participant });
};

export const removeParticipant = async (req: Request, res: Response) => {
  const { participantId } = req.params;

  await prisma.eventParticipant.delete({
    where: { id: participantId },
  });

  res.json({ status: "success", message: "Participant removed successfully" });
};

export const addVolunteer = async (req: Request, res: Response) => {
  const { id: eventId } = req.params;
  const { userId, name, email, phone, address, role } = req.body;

  // Check if volunteer already exists (by userId if provided, or by email)
  if (userId) {
    const existingRegistration = await prisma.eventVolunteer.findFirst({
      where: {
        eventId,
        userId,
      },
    });

    if (existingRegistration) {
      throw new AppError("User already registered as volunteer for this event", 400);
    }
  } else if (email) {
    const existingByEmail = await prisma.eventVolunteer.findFirst({
      where: {
        eventId,
        email,
      },
    });

    if (existingByEmail) {
      throw new AppError("Volunteer with this email already registered for this event", 400);
    }
  }

  const volunteer = await prisma.eventVolunteer.create({
    data: {
      eventId,
      userId: userId || null,
      name: name || null,
      email: email || null,
      phone: phone || null,
      address: address || null,
      role: role || null,
    },
    include: {
      user: userId ? {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      } : false,
    },
  });

  res.status(201).json({ status: "success", data: volunteer });
};

export const removeVolunteer = async (req: Request, res: Response) => {
  const { volunteerId } = req.params;

  await prisma.eventVolunteer.delete({
    where: { id: volunteerId },
  });

  res.json({ status: "success", message: "Volunteer removed successfully" });
};
