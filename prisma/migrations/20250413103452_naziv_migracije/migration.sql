-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "complaints" ADD COLUMN     "humanitarna_organizacija_id" TEXT;

-- CreateTable
CREATE TABLE "istorija_promena" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "humanitarna_organizacija_id" TEXT NOT NULL,
    "polje" TEXT NOT NULL,
    "stara_vrednost" TEXT NOT NULL,
    "nova_vrednost" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "istorija_promena_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "humanitarne_organizacije" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "naziv" TEXT NOT NULL,
    "kratkiBroj" TEXT NOT NULL,
    "ugovor" TEXT NOT NULL,
    "datum_pocetka" TIMESTAMP(3) NOT NULL,
    "datum_isteka" TIMESTAMP(3) NOT NULL,
    "racun" TEXT NOT NULL,
    "banka" TEXT NOT NULL,
    "pib" TEXT NOT NULL,
    "mb" TEXT NOT NULL,
    "namena" TEXT NOT NULL,
    "created_by_id" TEXT,

    CONSTRAINT "humanitarne_organizacije_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "humanitarne_organizacije_kratkiBroj_key" ON "humanitarne_organizacije"("kratkiBroj");

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_humanitarna_organizacija_id_fkey" FOREIGN KEY ("humanitarna_organizacija_id") REFERENCES "humanitarne_organizacije"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "istorija_promena" ADD CONSTRAINT "istorija_promena_humanitarna_organizacija_id_fkey" FOREIGN KEY ("humanitarna_organizacija_id") REFERENCES "humanitarne_organizacije"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "istorija_promena" ADD CONSTRAINT "istorija_promena_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "humanitarne_organizacije" ADD CONSTRAINT "humanitarne_organizacije_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
