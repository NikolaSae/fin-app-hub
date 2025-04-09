/*
  Warnings:

  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderCategory" (
    "provider_id" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderCategory_pkey" PRIMARY KEY ("provider_id","category_id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone_number" TEXT NOT NULL,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VasPostpaid" (
    "id" SERIAL NOT NULL,
    "Mesec_pruzanja_usluge" TEXT NOT NULL,
    "Jedinicna_cena" DECIMAL(65,30) NOT NULL,
    "Broj_transakcija" INTEGER NOT NULL,
    "Fakturisan_iznos" DECIMAL(65,30) NOT NULL,
    "Fakturisan_korigovan_iznos" DECIMAL(65,30) NOT NULL,
    "Naplacen_iznos" DECIMAL(65,30) NOT NULL,
    "Kumulativ_naplacenih_iznosa" DECIMAL(65,30) NOT NULL,
    "Nenaplacen_iznos" DECIMAL(65,30) NOT NULL,
    "Nenaplacen_korigovan_iznos" DECIMAL(65,30) NOT NULL,
    "Storniran_iznos_u_tekucem_mesecu_iz_perioda_pracenja" DECIMAL(65,30) NOT NULL,
    "Otkazan_iznos" DECIMAL(65,30) NOT NULL,
    "Kumulativ_otkazanih_iznosa" DECIMAL(65,30) NOT NULL,
    "Iznos_za_prenos_sredstava_" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VasPostpaid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkServisi" (
    "id" SERIAL NOT NULL,
    "naziv_usluge" TEXT NOT NULL,
    "opis_usluge" TEXT,
    "cena" DECIMAL(65,30),
    "broj_porudzbina" INTEGER NOT NULL,
    "datum_kreiranja" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkServisi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VasServisi" (
    "id" SERIAL NOT NULL,
    "grupa_usluga" TEXT NOT NULL,
    "naziv_servisa" TEXT NOT NULL,
    "cena" DECIMAL(65,30),
    "ukupno" DECIMAL(65,30),
    "broj_transakcija" INTEGER,
    "datum_kreiranja" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VasServisi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" SERIAL NOT NULL,
    "service_id" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "phone_number" TEXT,
    "service_request" TEXT,
    "price" DOUBLE PRECISION,
    "quantity" INTEGER,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "is_canceled" BOOLEAN NOT NULL DEFAULT false,
    "from_month" TIMESTAMP(3),
    "to_month" TIMESTAMP(3),
    "number_of_months" INTEGER,
    "first_sender" TEXT,
    "first_send_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserProviders" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_UserProviders_AB_unique" ON "_UserProviders"("A", "B");

-- CreateIndex
CREATE INDEX "_UserProviders_B_index" ON "_UserProviders"("B");

-- AddForeignKey
ALTER TABLE "ProviderCategory" ADD CONSTRAINT "ProviderCategory_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderCategory" ADD CONSTRAINT "ProviderCategory_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserProviders" ADD CONSTRAINT "_UserProviders_A_fkey" FOREIGN KEY ("A") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserProviders" ADD CONSTRAINT "_UserProviders_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
