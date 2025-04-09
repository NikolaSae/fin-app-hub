/*
  Warnings:

  - You are about to drop the column `Broj_transakcija` on the `VasPostpaid` table. All the data in the column will be lost.
  - You are about to drop the column `Fakturisan_iznos` on the `VasPostpaid` table. All the data in the column will be lost.
  - You are about to drop the column `Fakturisan_korigovan_iznos` on the `VasPostpaid` table. All the data in the column will be lost.
  - You are about to drop the column `Iznos_za_prenos_sredstava_` on the `VasPostpaid` table. All the data in the column will be lost.
  - You are about to drop the column `Jedinicna_cena` on the `VasPostpaid` table. All the data in the column will be lost.
  - You are about to drop the column `Kumulativ_naplacenih_iznosa` on the `VasPostpaid` table. All the data in the column will be lost.
  - You are about to drop the column `Kumulativ_otkazanih_iznosa` on the `VasPostpaid` table. All the data in the column will be lost.
  - You are about to drop the column `Mesec_pruzanja_usluge` on the `VasPostpaid` table. All the data in the column will be lost.
  - You are about to drop the column `Naplacen_iznos` on the `VasPostpaid` table. All the data in the column will be lost.
  - You are about to drop the column `Nenaplacen_iznos` on the `VasPostpaid` table. All the data in the column will be lost.
  - You are about to drop the column `Nenaplacen_korigovan_iznos` on the `VasPostpaid` table. All the data in the column will be lost.
  - You are about to drop the column `Otkazan_iznos` on the `VasPostpaid` table. All the data in the column will be lost.
  - Added the required column `broj_transakcija` to the `VasPostpaid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fakturisan_iznos` to the `VasPostpaid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fakturisan_korigovan_iznos` to the `VasPostpaid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iznos_za_prenos_sredstava_` to the `VasPostpaid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jedinicna_cena` to the `VasPostpaid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kumulativ_naplacenih_iznosa` to the `VasPostpaid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kumulativ_otkazanih_iznosa` to the `VasPostpaid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mesec_pruzanja_usluge` to the `VasPostpaid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `naplacen_iznos` to the `VasPostpaid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nenaplacen_iznos` to the `VasPostpaid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nenaplacen_korigovan_iznos` to the `VasPostpaid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otkazan_iznos` to the `VasPostpaid` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VasPostpaid" DROP COLUMN "Broj_transakcija",
DROP COLUMN "Fakturisan_iznos",
DROP COLUMN "Fakturisan_korigovan_iznos",
DROP COLUMN "Iznos_za_prenos_sredstava_",
DROP COLUMN "Jedinicna_cena",
DROP COLUMN "Kumulativ_naplacenih_iznosa",
DROP COLUMN "Kumulativ_otkazanih_iznosa",
DROP COLUMN "Mesec_pruzanja_usluge",
DROP COLUMN "Naplacen_iznos",
DROP COLUMN "Nenaplacen_iznos",
DROP COLUMN "Nenaplacen_korigovan_iznos",
DROP COLUMN "Otkazan_iznos",
ADD COLUMN     "broj_transakcija" INTEGER NOT NULL,
ADD COLUMN     "fakturisan_iznos" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "fakturisan_korigovan_iznos" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "iznos_za_prenos_sredstava_" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "jedinicna_cena" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "kumulativ_naplacenih_iznosa" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "kumulativ_otkazanih_iznosa" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "mesec_pruzanja_usluge" TEXT NOT NULL,
ADD COLUMN     "naplacen_iznos" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "nenaplacen_iznos" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "nenaplacen_korigovan_iznos" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "otkazan_iznos" DECIMAL(65,30) NOT NULL;
