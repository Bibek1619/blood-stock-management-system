-- AlterTable
ALTER TABLE "BloodPack" ADD COLUMN     "donationId" TEXT;

-- CreateIndex
CREATE INDEX "BloodPack_donationId_idx" ON "BloodPack"("donationId");

-- AddForeignKey
ALTER TABLE "BloodPack" ADD CONSTRAINT "BloodPack_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "Donation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
