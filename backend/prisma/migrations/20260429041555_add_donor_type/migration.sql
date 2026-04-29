-- AlterTable
ALTER TABLE "Donor" ADD COLUMN     "donorType" "DonationType" NOT NULL DEFAULT 'PERSON';

-- CreateIndex
CREATE INDEX "Donor_donorType_idx" ON "Donor"("donorType");
