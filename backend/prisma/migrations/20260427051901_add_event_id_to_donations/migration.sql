-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "eventId" TEXT;

-- CreateIndex
CREATE INDEX "Donation_eventId_idx" ON "Donation"("eventId");

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
