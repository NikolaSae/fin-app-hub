-- CreateEnum
CREATE TYPE "VasType" AS ENUM ('prepaid', 'postpaid');

-- CreateEnum
CREATE TYPE "HumanType" AS ENUM ('prepaid', 'postpaid');

-- CreateTable
CREATE TABLE "providers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vas_services" (
    "id" TEXT NOT NULL,
    "proizvod" TEXT NOT NULL,
    "mesec_pruzanja_usluge" TIMESTAMP(3) NOT NULL,
    "jedinicna_cena" DOUBLE PRECISION NOT NULL,
    "broj_transakcija" INTEGER NOT NULL,
    "fakturisan_iznos" DOUBLE PRECISION NOT NULL,
    "fakturisan_korigovan_iznos" DOUBLE PRECISION NOT NULL,
    "naplacen_iznos" DOUBLE PRECISION NOT NULL,
    "kumulativ_naplacenih_iznosa" DOUBLE PRECISION NOT NULL,
    "nenaplacen_iznos" DOUBLE PRECISION NOT NULL,
    "nenaplacen_korigovan_iznos" DOUBLE PRECISION NOT NULL,
    "storniran_iznos" DOUBLE PRECISION NOT NULL,
    "otkazan_iznos" DOUBLE PRECISION NOT NULL,
    "kumulativ_otkazanih_iznosa" DOUBLE PRECISION NOT NULL,
    "iznos_za_prenos_sredstava" DOUBLE PRECISION NOT NULL,
    "type" "VasType" NOT NULL,
    "provajderId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vas_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bulk_services" (
    "id" TEXT NOT NULL,
    "provider_name" TEXT NOT NULL,
    "agreement_name" TEXT NOT NULL,
    "service_name" TEXT NOT NULL,
    "step_name" TEXT NOT NULL,
    "sender_name" TEXT NOT NULL,
    "requests" INTEGER NOT NULL,
    "message_parts" INTEGER NOT NULL,
    "provajderId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bulk_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parking_services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "provajderId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parking_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "human_services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "HumanType" NOT NULL,
    "provajderId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "human_services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "providers_name_key" ON "providers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "vas_services_proizvod_mesec_pruzanja_usluge_provajderId_key" ON "vas_services"("proizvod", "mesec_pruzanja_usluge", "provajderId");

-- CreateIndex
CREATE UNIQUE INDEX "bulk_services_provider_name_agreement_name_service_name_sen_key" ON "bulk_services"("provider_name", "agreement_name", "service_name", "sender_name", "requests", "message_parts");

-- AddForeignKey
ALTER TABLE "vas_services" ADD CONSTRAINT "vas_services_provajderId_fkey" FOREIGN KEY ("provajderId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulk_services" ADD CONSTRAINT "bulk_services_provajderId_fkey" FOREIGN KEY ("provajderId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_services" ADD CONSTRAINT "parking_services_provajderId_fkey" FOREIGN KEY ("provajderId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "human_services" ADD CONSTRAINT "human_services_provajderId_fkey" FOREIGN KEY ("provajderId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
