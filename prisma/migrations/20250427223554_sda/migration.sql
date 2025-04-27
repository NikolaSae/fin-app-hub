-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "humanitarianOrgId" TEXT;

-- CreateIndex
CREATE INDEX "Complaint_humanitarianOrgId_idx" ON "Complaint"("humanitarianOrgId");

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_humanitarianOrgId_fkey" FOREIGN KEY ("humanitarianOrgId") REFERENCES "HumanitarianOrg"("id") ON DELETE SET NULL ON UPDATE CASCADE;
