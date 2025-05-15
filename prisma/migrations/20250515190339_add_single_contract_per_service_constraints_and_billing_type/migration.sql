/*
  Warnings:

  - A unique constraint covering the columns `[humanitarianOrgId]` on the table `Contract` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[parkingServiceId]` on the table `Contract` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serviceId]` on the table `ServiceContract` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "BillingType" AS ENUM ('PREPAID', 'POSTPAID');

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "billingType" "BillingType";

-- CreateIndex
CREATE UNIQUE INDEX "Contract_humanitarianOrgId_key" ON "Contract"("humanitarianOrgId");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_parkingServiceId_key" ON "Contract"("parkingServiceId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceContract_serviceId_key" ON "ServiceContract"("serviceId");
