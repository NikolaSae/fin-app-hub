/*
  Warnings:

  - A unique constraint covering the columns `[provider_name,agreement_name,service_name,sender_name]` on the table `BulkService` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "BulkService_provider_name_agreement_name_service_name_sende_key";

-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "parkingServiceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "BulkService_provider_name_agreement_name_service_name_sende_key" ON "BulkService"("provider_name", "agreement_name", "service_name", "sender_name");

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_parkingServiceId_fkey" FOREIGN KEY ("parkingServiceId") REFERENCES "ParkingService"("id") ON DELETE SET NULL ON UPDATE CASCADE;
