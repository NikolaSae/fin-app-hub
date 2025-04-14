-- AlterTable
ALTER TABLE "bulk_services" ADD COLUMN     "kpi" TEXT,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "status" TEXT;

-- AlterTable
ALTER TABLE "complaints" ADD COLUMN     "bulkServiceId" TEXT,
ADD COLUMN     "humanServiceId" TEXT,
ADD COLUMN     "parkingServiceId" TEXT,
ADD COLUMN     "vasServiceId" TEXT;

-- AlterTable
ALTER TABLE "human_services" ADD COLUMN     "kpi" TEXT,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "status" TEXT;

-- AlterTable
ALTER TABLE "parking_services" ADD COLUMN     "kpi" TEXT,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "status" TEXT;

-- AlterTable
ALTER TABLE "vas_services" ADD COLUMN     "kpi" TEXT,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "status" TEXT;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_vasServiceId_fkey" FOREIGN KEY ("vasServiceId") REFERENCES "vas_services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_bulkServiceId_fkey" FOREIGN KEY ("bulkServiceId") REFERENCES "bulk_services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_parkingServiceId_fkey" FOREIGN KEY ("parkingServiceId") REFERENCES "parking_services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_humanServiceId_fkey" FOREIGN KEY ("humanServiceId") REFERENCES "human_services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
