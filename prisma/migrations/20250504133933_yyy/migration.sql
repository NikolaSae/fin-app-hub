/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Provider` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Provider_name_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Provider_name_key" ON "Provider"("name");
