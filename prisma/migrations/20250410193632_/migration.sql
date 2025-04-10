/*
  Warnings:

  - You are about to drop the `BulkServisi` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Complaint` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Provider` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProviderCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Service` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServiceCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VasPostpaid` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VasServisi` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserProviders` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ComplaintType" AS ENUM ('PRODUCT_DEFECT', 'SERVICE_ISSUE', 'DELIVERY_PROBLEM', 'BILLING_ISSUE', 'OTHER');

-- DropForeignKey
ALTER TABLE "ProviderCategory" DROP CONSTRAINT "ProviderCategory_category_id_fkey";

-- DropForeignKey
ALTER TABLE "ProviderCategory" DROP CONSTRAINT "ProviderCategory_provider_id_fkey";

-- DropForeignKey
ALTER TABLE "_UserProviders" DROP CONSTRAINT "_UserProviders_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserProviders" DROP CONSTRAINT "_UserProviders_B_fkey";

-- DropTable
DROP TABLE "BulkServisi";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "Complaint";

-- DropTable
DROP TABLE "Customer";

-- DropTable
DROP TABLE "Provider";

-- DropTable
DROP TABLE "ProviderCategory";

-- DropTable
DROP TABLE "Service";

-- DropTable
DROP TABLE "ServiceCategory";

-- DropTable
DROP TABLE "VasPostpaid";

-- DropTable
DROP TABLE "VasServisi";

-- DropTable
DROP TABLE "_UserProviders";

-- CreateTable
CREATE TABLE "complaints" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ComplaintType" NOT NULL DEFAULT 'OTHER',
    "status" "ComplaintStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "userId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "productId" TEXT,
    "resolution" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT,
    "price" DECIMAL(10,2),
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaint_history" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "oldStatus" "ComplaintStatus",
    "newStatus" "ComplaintStatus" NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "complaint_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaint_comments" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "complaint_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "complaints_userId_idx" ON "complaints"("userId");

-- CreateIndex
CREATE INDEX "complaints_status_idx" ON "complaints"("status");

-- CreateIndex
CREATE INDEX "complaints_assignedToId_idx" ON "complaints"("assignedToId");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "complaint_history_complaintId_idx" ON "complaint_history"("complaintId");

-- CreateIndex
CREATE INDEX "complaint_comments_complaintId_idx" ON "complaint_comments"("complaintId");

-- CreateIndex
CREATE INDEX "attachments_complaintId_idx" ON "attachments"("complaintId");

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_history" ADD CONSTRAINT "complaint_history_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_history" ADD CONSTRAINT "complaint_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_comments" ADD CONSTRAINT "complaint_comments_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_comments" ADD CONSTRAINT "complaint_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
