/*
  Warnings:

  - The values [ONGOING] on the enum `EventStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `donationId` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `bloodType` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `bloodType` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `lastDonation` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `registered` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the `BloodStock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventRegistration` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `recipientName` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bloodGroup` to the `Donation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bloodGroup` to the `Donor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Donor` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE');

-- CreateEnum
CREATE TYPE "PackStatus" AS ENUM ('AVAILABLE', 'USED', 'EXPIRED', 'RESERVED');

-- CreateEnum
CREATE TYPE "DonationType" AS ENUM ('PERSON', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "RecipientType" AS ENUM ('PERSON', 'ORGANIZATION', 'HOSPITAL');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('REGISTERED', 'ATTENDED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "VolunteerStatus" AS ENUM ('REGISTERED', 'ATTENDED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "CertificateType" AS ENUM ('DONATION', 'VOLUNTEER');

-- AlterEnum
BEGIN;
CREATE TYPE "EventStatus_new" AS ENUM ('UPCOMING', 'RUNNING', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."Event" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Event" ALTER COLUMN "status" TYPE "EventStatus_new" USING ("status"::text::"EventStatus_new");
ALTER TYPE "EventStatus" RENAME TO "EventStatus_old";
ALTER TYPE "EventStatus_new" RENAME TO "EventStatus";
DROP TYPE "public"."EventStatus_old";
ALTER TABLE "Event" ALTER COLUMN "status" SET DEFAULT 'UPCOMING';
COMMIT;

-- DropForeignKey
ALTER TABLE "Certificate" DROP CONSTRAINT "Certificate_userId_fkey";

-- DropForeignKey
ALTER TABLE "Donation" DROP CONSTRAINT "Donation_userId_fkey";

-- DropForeignKey
ALTER TABLE "EventRegistration" DROP CONSTRAINT "EventRegistration_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventRegistration" DROP CONSTRAINT "EventRegistration_userId_fkey";

-- AlterTable
ALTER TABLE "Certificate" DROP COLUMN "donationId",
ADD COLUMN     "eventTitle" TEXT,
ADD COLUMN     "recipientName" TEXT NOT NULL,
ADD COLUMN     "type" "CertificateType" NOT NULL DEFAULT 'DONATION',
ADD COLUMN     "volunteerId" TEXT;

-- AlterTable
ALTER TABLE "Donation" DROP COLUMN "bloodType",
DROP COLUMN "quantity",
ADD COLUMN     "bloodGroup" "BloodGroup" NOT NULL,
ADD COLUMN     "contact" TEXT,
ADD COLUMN     "donationType" "DonationType" NOT NULL DEFAULT 'PERSON',
ADD COLUMN     "donorId" TEXT,
ADD COLUMN     "units" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "status" SET DEFAULT 'COMPLETED';

-- AlterTable
ALTER TABLE "Donor" DROP COLUMN "bloodType",
DROP COLUMN "lastDonation",
DROP COLUMN "state",
DROP COLUMN "zipCode",
ADD COLUMN     "bloodGroup" "BloodGroup" NOT NULL,
ADD COLUMN     "lastDonationDate" TIMESTAMP(3),
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "medicalNotes" TEXT,
ADD COLUMN     "weight" DOUBLE PRECISION,
ALTER COLUMN "dateOfBirth" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "endTime",
DROP COLUMN "registered",
DROP COLUMN "startTime",
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "capacity" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "phone" SET NOT NULL;

-- DropTable
DROP TABLE "BloodStock";

-- DropTable
DROP TABLE "EventRegistration";

-- DropEnum
DROP TYPE "BloodType";

-- DropEnum
DROP TYPE "RegistrationStatus";

-- CreateTable
CREATE TABLE "BloodPack" (
    "id" TEXT NOT NULL,
    "packCode" TEXT NOT NULL,
    "bloodGroup" "BloodGroup" NOT NULL,
    "donorId" TEXT,
    "collectionDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "status" "PackStatus" NOT NULL DEFAULT 'AVAILABLE',
    "storageLocation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BloodPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloodStockSummary" (
    "id" TEXT NOT NULL,
    "bloodGroup" "BloodGroup" NOT NULL,
    "available" INTEGER NOT NULL DEFAULT 0,
    "used" INTEGER NOT NULL DEFAULT 0,
    "expired" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BloodStockSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloodIssue" (
    "id" TEXT NOT NULL,
    "issueCode" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "recipientType" "RecipientType" NOT NULL DEFAULT 'PERSON',
    "bloodGroup" "BloodGroup" NOT NULL,
    "unitsRequested" INTEGER NOT NULL,
    "unitsIssued" INTEGER NOT NULL,
    "contact" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issuedBy" TEXT,
    "status" "IssueStatus" NOT NULL DEFAULT 'COMPLETED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BloodIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloodIssueItem" (
    "id" TEXT NOT NULL,
    "bloodIssueId" TEXT NOT NULL,
    "bloodPackId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BloodIssueItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventParticipant" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ParticipantStatus" NOT NULL DEFAULT 'REGISTERED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventVolunteer" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "role" TEXT,
    "status" "VolunteerStatus" NOT NULL DEFAULT 'REGISTERED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventVolunteer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BloodPack_packCode_key" ON "BloodPack"("packCode");

-- CreateIndex
CREATE INDEX "BloodPack_bloodGroup_idx" ON "BloodPack"("bloodGroup");

-- CreateIndex
CREATE INDEX "BloodPack_status_idx" ON "BloodPack"("status");

-- CreateIndex
CREATE INDEX "BloodPack_expiryDate_idx" ON "BloodPack"("expiryDate");

-- CreateIndex
CREATE INDEX "BloodPack_packCode_idx" ON "BloodPack"("packCode");

-- CreateIndex
CREATE UNIQUE INDEX "BloodStockSummary_bloodGroup_key" ON "BloodStockSummary"("bloodGroup");

-- CreateIndex
CREATE INDEX "BloodStockSummary_bloodGroup_idx" ON "BloodStockSummary"("bloodGroup");

-- CreateIndex
CREATE UNIQUE INDEX "BloodIssue_issueCode_key" ON "BloodIssue"("issueCode");

-- CreateIndex
CREATE INDEX "BloodIssue_bloodGroup_idx" ON "BloodIssue"("bloodGroup");

-- CreateIndex
CREATE INDEX "BloodIssue_issueDate_idx" ON "BloodIssue"("issueDate");

-- CreateIndex
CREATE INDEX "BloodIssue_recipientType_idx" ON "BloodIssue"("recipientType");

-- CreateIndex
CREATE INDEX "BloodIssueItem_bloodIssueId_idx" ON "BloodIssueItem"("bloodIssueId");

-- CreateIndex
CREATE INDEX "BloodIssueItem_bloodPackId_idx" ON "BloodIssueItem"("bloodPackId");

-- CreateIndex
CREATE UNIQUE INDEX "BloodIssueItem_bloodIssueId_bloodPackId_key" ON "BloodIssueItem"("bloodIssueId", "bloodPackId");

-- CreateIndex
CREATE INDEX "EventParticipant_eventId_idx" ON "EventParticipant"("eventId");

-- CreateIndex
CREATE INDEX "EventParticipant_userId_idx" ON "EventParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EventParticipant_eventId_userId_key" ON "EventParticipant"("eventId", "userId");

-- CreateIndex
CREATE INDEX "EventVolunteer_eventId_idx" ON "EventVolunteer"("eventId");

-- CreateIndex
CREATE INDEX "EventVolunteer_userId_idx" ON "EventVolunteer"("userId");

-- CreateIndex
CREATE INDEX "Certificate_userId_idx" ON "Certificate"("userId");

-- CreateIndex
CREATE INDEX "Certificate_type_idx" ON "Certificate"("type");

-- CreateIndex
CREATE INDEX "Certificate_certificateNumber_idx" ON "Certificate"("certificateNumber");

-- CreateIndex
CREATE INDEX "Donation_userId_idx" ON "Donation"("userId");

-- CreateIndex
CREATE INDEX "Donation_bloodGroup_idx" ON "Donation"("bloodGroup");

-- CreateIndex
CREATE INDEX "Donation_donationDate_idx" ON "Donation"("donationDate");

-- CreateIndex
CREATE INDEX "Donation_donationType_idx" ON "Donation"("donationType");

-- CreateIndex
CREATE INDEX "Donor_bloodGroup_idx" ON "Donor"("bloodGroup");

-- CreateIndex
CREATE INDEX "Donor_location_idx" ON "Donor"("location");

-- CreateIndex
CREATE INDEX "Donor_isEligible_idx" ON "Donor"("isEligible");

-- CreateIndex
CREATE INDEX "Donor_latitude_longitude_idx" ON "Donor"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Event_eventDate_idx" ON "Event"("eventDate");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- AddForeignKey
ALTER TABLE "Donor" ADD CONSTRAINT "Donor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodPack" ADD CONSTRAINT "BloodPack_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodIssue" ADD CONSTRAINT "BloodIssue_issuedBy_fkey" FOREIGN KEY ("issuedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodIssueItem" ADD CONSTRAINT "BloodIssueItem_bloodIssueId_fkey" FOREIGN KEY ("bloodIssueId") REFERENCES "BloodIssue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodIssueItem" ADD CONSTRAINT "BloodIssueItem_bloodPackId_fkey" FOREIGN KEY ("bloodPackId") REFERENCES "BloodPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventVolunteer" ADD CONSTRAINT "EventVolunteer_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventVolunteer" ADD CONSTRAINT "EventVolunteer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
