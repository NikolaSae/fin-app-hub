/*
  Warnings:

  - You are about to drop the column `providerId` on the `SenderBlacklist` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "SenderBlacklist" DROP CONSTRAINT "SenderBlacklist_providerId_fkey";

-- DropIndex
DROP INDEX "SenderBlacklist_providerId_idx";

-- DropIndex
DROP INDEX "SenderBlacklist_senderName_providerId_key";

-- AlterTable
ALTER TABLE "SenderBlacklist" DROP COLUMN "providerId";
