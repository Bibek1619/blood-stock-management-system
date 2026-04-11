import { z } from "zod";

// Enums
export const RoleEnum = z.enum(["DONOR", "ADMIN", "STAFF"]);

export const BloodGroupEnum = z.enum([
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE",
]);

export const PackStatusEnum = z.enum(["AVAILABLE", "USED", "EXPIRED", "RESERVED"]);

export const DonationTypeEnum = z.enum(["PERSON", "ORGANIZATION"]);

export const RecipientTypeEnum = z.enum(["PERSON", "ORGANIZATION", "HOSPITAL"]);

export const DonationStatusEnum = z.enum(["PENDING", "COMPLETED", "CANCELLED", "REJECTED"]);

export const IssueStatusEnum = z.enum(["PENDING", "COMPLETED", "CANCELLED"]);

export const EventStatusEnum = z.enum(["UPCOMING", "RUNNING", "COMPLETED", "CANCELLED"]);

export const ParticipantStatusEnum = z.enum(["REGISTERED", "ATTENDED", "CANCELLED", "NO_SHOW"]);

export const VolunteerStatusEnum = z.enum(["REGISTERED", "ATTENDED", "CANCELLED", "NO_SHOW"]);

export const CertificateTypeEnum = z.enum(["DONATION", "VOLUNTEER"]);

// User Schemas
export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  role: RoleEnum.optional().default("DONOR"),
});

export const updateUserSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().min(10, "Phone number must be at least 10 characters").optional(),
  role: RoleEnum.optional(),
});

// Donor Schemas
export const createDonorSchema = z.object({
  userId: z.string().cuid("Invalid user ID"),
  bloodGroup: BloodGroupEnum,
  location: z.string().min(2, "Location is required"),
  city: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  weight: z.number().positive("Weight must be positive").optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  medicalNotes: z.string().optional(),
});

export const updateDonorSchema = z.object({
  bloodGroup: BloodGroupEnum.optional(),
  location: z.string().min(2, "Location is required").optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  weight: z.number().positive("Weight must be positive").optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  isEligible: z.boolean().optional(),
  medicalNotes: z.string().optional(),
});

// Donation Schemas
export const createDonationSchema = z.object({
  userId: z.string().cuid("Invalid user ID"),
  bloodGroup: BloodGroupEnum,
  units: z.number().int().positive("Units must be positive").default(1),
  location: z.string().min(2, "Location is required"),
  donationType: DonationTypeEnum.optional().default("PERSON"),
  status: DonationStatusEnum.optional().default("COMPLETED"),
  notes: z.string().optional(),
  contact: z.string().optional(),
});

export const updateDonationSchema = z.object({
  bloodGroup: BloodGroupEnum.optional(),
  units: z.number().int().positive("Units must be positive").optional(),
  location: z.string().min(2, "Location is required").optional(),
  donationType: DonationTypeEnum.optional(),
  status: DonationStatusEnum.optional(),
  notes: z.string().optional(),
  contact: z.string().optional(),
});

// Blood Pack Schemas
export const createBloodPackSchema = z.object({
  packCode: z.string().min(3, "Pack code must be at least 3 characters"),
  bloodGroup: BloodGroupEnum,
  donorId: z.string().cuid("Invalid donor ID").optional(),
  collectionDate: z.string().datetime("Invalid collection date"),
  expiryDate: z.string().datetime("Invalid expiry date"),
  storageLocation: z.string().optional(),
  status: PackStatusEnum.optional().default("AVAILABLE"),
});

export const updateBloodPackSchema = z.object({
  packCode: z.string().min(3, "Pack code must be at least 3 characters").optional(),
  bloodGroup: BloodGroupEnum.optional(),
  donorId: z.string().cuid("Invalid donor ID").optional().nullable(),
  collectionDate: z.string().datetime("Invalid collection date").optional(),
  expiryDate: z.string().datetime("Invalid expiry date").optional(),
  storageLocation: z.string().optional(),
  status: PackStatusEnum.optional(),
});

// Blood Issue Schemas
export const createBloodIssueSchema = z.object({
  issueCode: z.string().min(3, "Issue code must be at least 3 characters"),
  recipientName: z.string().min(2, "Recipient name is required"),
  recipientType: RecipientTypeEnum.optional().default("PERSON"),
  bloodGroup: BloodGroupEnum,
  unitsRequested: z.number().int().positive("Units requested must be positive"),
  contact: z.string().min(10, "Contact is required"),
  issuedBy: z.string().cuid("Invalid user ID").optional(),
  bloodPackIds: z.array(z.string().cuid("Invalid blood pack ID")).min(1, "At least one blood pack is required"),
  notes: z.string().optional(),
  status: IssueStatusEnum.optional().default("COMPLETED"),
});

export const updateBloodIssueSchema = z.object({
  recipientName: z.string().min(2, "Recipient name is required").optional(),
  recipientType: RecipientTypeEnum.optional(),
  unitsRequested: z.number().int().positive("Units requested must be positive").optional(),
  contact: z.string().min(10, "Contact is required").optional(),
  status: IssueStatusEnum.optional(),
  notes: z.string().optional(),
});

// Event Schemas
export const createEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  location: z.string().min(2, "Location is required"),
  eventDate: z.string().datetime("Invalid event date"),
  capacity: z.number().int().positive("Capacity must be positive").optional(),
  status: EventStatusEnum.optional().default("UPCOMING"),
});

export const updateEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  description: z.string().optional(),
  location: z.string().min(2, "Location is required").optional(),
  eventDate: z.string().datetime("Invalid event date").optional(),
  capacity: z.number().int().positive("Capacity must be positive").optional(),
  status: EventStatusEnum.optional(),
});

export const registerParticipantSchema = z.object({
  eventId: z.string().cuid("Invalid event ID"),
  userId: z.string().cuid("Invalid user ID"),
});

export const registerVolunteerSchema = z.object({
  eventId: z.string().cuid("Invalid event ID"),
  userId: z.string().cuid("Invalid user ID"),
  role: z.string().optional(),
});

// Certificate Schemas
export const createCertificateSchema = z.object({
  certificateNumber: z.string().min(3, "Certificate number must be at least 3 characters"),
  type: CertificateTypeEnum.optional().default("DONATION"),
  userId: z.string().cuid("Invalid user ID"),
  recipientName: z.string().min(2, "Recipient name is required"),
  eventTitle: z.string().optional(),
  volunteerId: z.string().optional(),
});

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateDonorInput = z.infer<typeof createDonorSchema>;
export type UpdateDonorInput = z.infer<typeof updateDonorSchema>;
export type CreateDonationInput = z.infer<typeof createDonationSchema>;
export type UpdateDonationInput = z.infer<typeof updateDonationSchema>;
export type CreateBloodPackInput = z.infer<typeof createBloodPackSchema>;
export type UpdateBloodPackInput = z.infer<typeof updateBloodPackSchema>;
export type CreateBloodIssueInput = z.infer<typeof createBloodIssueSchema>;
export type UpdateBloodIssueInput = z.infer<typeof updateBloodIssueSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type RegisterParticipantInput = z.infer<typeof registerParticipantSchema>;
export type RegisterVolunteerInput = z.infer<typeof registerVolunteerSchema>;
export type CreateCertificateInput = z.infer<typeof createCertificateSchema>;
