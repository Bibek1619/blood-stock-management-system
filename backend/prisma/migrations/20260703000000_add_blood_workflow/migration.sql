-- CreateEnum (skip if already exists)
DO $$ BEGIN
    CREATE TYPE "BloodCollectionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum (skip if already exists)
DO $$ BEGIN
    CREATE TYPE "TestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE "BloodCollection" (
    "id" TEXT NOT NULL,
    "bloodCode" TEXT NOT NULL,
    "donorId" TEXT,
    "donorName" TEXT NOT NULL,
    "bloodGroup" "BloodGroup" NOT NULL,
    "quantityMl" INTEGER NOT NULL DEFAULT 450,
    "collectionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "BloodCollectionStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BloodCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloodTest" (
    "id" TEXT NOT NULL,
    "bloodCollectionId" TEXT NOT NULL,
    "hiv" BOOLEAN NOT NULL DEFAULT false,
    "hepatitisB" BOOLEAN NOT NULL DEFAULT false,
    "hepatitisC" BOOLEAN NOT NULL DEFAULT false,
    "malaria" BOOLEAN NOT NULL DEFAULT false,
    "syphilis" BOOLEAN NOT NULL DEFAULT false,
    "testedBy" TEXT,
    "testDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "TestStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BloodTest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BloodCollection_bloodCode_key" ON "BloodCollection"("bloodCode");

-- CreateIndex
CREATE INDEX "BloodCollection_bloodGroup_idx" ON "BloodCollection"("bloodGroup");

-- CreateIndex
CREATE INDEX "BloodCollection_status_idx" ON "BloodCollection"("status");

-- CreateIndex
CREATE INDEX "BloodCollection_collectionDate_idx" ON "BloodCollection"("collectionDate");

-- CreateIndex
CREATE UNIQUE INDEX "BloodTest_bloodCollectionId_key" ON "BloodTest"("bloodCollectionId");

-- CreateIndex
CREATE INDEX "BloodTest_status_idx" ON "BloodTest"("status");

-- AddForeignKey
ALTER TABLE "BloodCollection" ADD CONSTRAINT "BloodCollection_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodTest" ADD CONSTRAINT "BloodTest_bloodCollectionId_fkey" FOREIGN KEY ("bloodCollectionId") REFERENCES "BloodCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodTest" ADD CONSTRAINT "BloodTest_testedBy_fkey" FOREIGN KEY ("testedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
