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
CREATE TYPE "ClaimStatus" AS ENUM ('DRAFT', 'NEW', 'PROCESSING', 'WAITING_FOR_INFO', 'RESOLVED', 'REJECTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ClaimType" AS ENUM ('PRODUCT_DEFECT', 'SHIPPING_DAMAGE', 'WRONG_ITEM', 'MISSING_ITEM', 'RETURN_REFUND', 'SERVICE_COMPLAINT', 'WARRANTY', 'OTHER');

-- CreateEnum
CREATE TYPE "ClaimActionType" AS ENUM ('STATUS_CHANGE', 'ASSIGNMENT', 'CUSTOMER_REPLY', 'INTERNAL_COMMENT', 'ATTACHMENT_ADDED', 'AI_PROCESSING', 'MANUAL_UPDATE');

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
CREATE TABLE "claims" (
    "id" TEXT NOT NULL,
    "claimNumber" TEXT NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'NEW',
    "type" "ClaimType" NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 3,
    "submitterId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "source_email_id" TEXT,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "originalData" JSONB,
    "processedData" JSONB,
    "customerName" TEXT,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "customerReference" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_sources" (
    "id" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "recipients" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL,
    "rawContent" TEXT NOT NULL,
    "thread_id" TEXT,
    "headers" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "claimId" TEXT,
    "email_source_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim_notes" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_internal" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "claim_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim_actions" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actionType" "ClaimActionType" NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claim_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim_history" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changed_by" TEXT NOT NULL,

    CONSTRAINT "claim_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_processing_logs" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "prompt_used" TEXT NOT NULL,
    "ai_response" TEXT NOT NULL,
    "processing_time" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_processing_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_prompt_templates" (
    "id" TEXT NOT NULL,
    "claimType" "ClaimType" NOT NULL,
    "prompt_template" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_prompt_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "claims_claimNumber_key" ON "claims"("claimNumber");

-- CreateIndex
CREATE INDEX "claims_submitterId_idx" ON "claims"("submitterId");

-- CreateIndex
CREATE INDEX "claims_assignedToId_idx" ON "claims"("assignedToId");

-- CreateIndex
CREATE INDEX "claims_status_idx" ON "claims"("status");

-- CreateIndex
CREATE INDEX "claims_type_idx" ON "claims"("type");

-- CreateIndex
CREATE INDEX "claims_created_at_idx" ON "claims"("created_at");

-- CreateIndex
CREATE INDEX "email_sources_sender_idx" ON "email_sources"("sender");

-- CreateIndex
CREATE INDEX "email_sources_thread_id_idx" ON "email_sources"("thread_id");

-- CreateIndex
CREATE INDEX "email_sources_received_at_idx" ON "email_sources"("received_at");

-- CreateIndex
CREATE INDEX "attachments_claimId_idx" ON "attachments"("claimId");

-- CreateIndex
CREATE INDEX "attachments_email_source_id_idx" ON "attachments"("email_source_id");

-- CreateIndex
CREATE INDEX "claim_notes_claimId_idx" ON "claim_notes"("claimId");

-- CreateIndex
CREATE INDEX "claim_notes_authorId_idx" ON "claim_notes"("authorId");

-- CreateIndex
CREATE INDEX "claim_actions_claimId_idx" ON "claim_actions"("claimId");

-- CreateIndex
CREATE INDEX "claim_actions_userId_idx" ON "claim_actions"("userId");

-- CreateIndex
CREATE INDEX "claim_actions_actionType_idx" ON "claim_actions"("actionType");

-- CreateIndex
CREATE INDEX "claim_history_claimId_idx" ON "claim_history"("claimId");

-- CreateIndex
CREATE INDEX "claim_history_changed_at_idx" ON "claim_history"("changed_at");

-- CreateIndex
CREATE INDEX "ai_processing_logs_claimId_idx" ON "ai_processing_logs"("claimId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_prompt_templates_claimType_key" ON "ai_prompt_templates"("claimType");

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_source_email_id_fkey" FOREIGN KEY ("source_email_id") REFERENCES "email_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_email_source_id_fkey" FOREIGN KEY ("email_source_id") REFERENCES "email_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_notes" ADD CONSTRAINT "claim_notes_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_notes" ADD CONSTRAINT "claim_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_actions" ADD CONSTRAINT "claim_actions_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_actions" ADD CONSTRAINT "claim_actions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_history" ADD CONSTRAINT "claim_history_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;
