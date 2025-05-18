-- CreateEnum
CREATE TYPE "LogActionType" AS ENUM ('ACTIVATION', 'DEACTIVATION', 'STATUS_CHANGE', 'NOTE');

-- CreateEnum
CREATE TYPE "LogStatus" AS ENUM ('IN_PROGRESS', 'FINISHED');

-- CreateEnum
CREATE TYPE "LogEntityType" AS ENUM ('PROVIDER', 'PARKING_SERVICE', 'BULK_SERVICE');

-- AlterEnum
ALTER TYPE "ContractStatus" ADD VALUE 'TERMINATED';

-- CreateTable
CREATE TABLE "LogEntry" (
    "id" TEXT NOT NULL,
    "entityType" "LogEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" "LogActionType" NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "status" "LogStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "sendEmail" BOOLEAN NOT NULL DEFAULT false,
    "providerId" TEXT,
    "parkingServiceId" TEXT,
    "bulkServiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "LogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LogEntry_entityType_entityId_idx" ON "LogEntry"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "LogEntry_providerId_idx" ON "LogEntry"("providerId");

-- CreateIndex
CREATE INDEX "LogEntry_parkingServiceId_idx" ON "LogEntry"("parkingServiceId");

-- CreateIndex
CREATE INDEX "LogEntry_bulkServiceId_idx" ON "LogEntry"("bulkServiceId");

-- CreateIndex
CREATE INDEX "LogEntry_createdById_idx" ON "LogEntry"("createdById");

-- CreateIndex
CREATE INDEX "LogEntry_createdAt_idx" ON "LogEntry"("createdAt");

-- CreateIndex
CREATE INDEX "Provider_name_idx" ON "Provider"("name");

-- AddForeignKey
ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_parkingServiceId_fkey" FOREIGN KEY ("parkingServiceId") REFERENCES "ParkingService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_bulkServiceId_fkey" FOREIGN KEY ("bulkServiceId") REFERENCES "BulkService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
