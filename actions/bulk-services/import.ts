//actions/bulk-services/import.ts


"use server";

import { db } from "@/lib/db";
import { ServerError } from "@/lib/exceptions";
import { getCurrentUser } from "@/lib/session";
import { processBulkServiceImport } from "@/lib/bulk-services/csv-processor"; // Import je OK
import { ActivityLogService } from "@/lib/services/activity-log-service";
import { LogSeverity } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function importBulkServices(file: File) { // Promenio sam fileContent u File, jer processBulkServiceImport očekuje File
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error("Unauthorized");
    }

    // Process the CSV file content
    // POZIV FUNKCIJE I DESTRUKTURIRANJE ISPRAVLJENO
    const result = await processBulkServiceImport(file); // Pozovi funkciju sa ispravnim imenom i prosledi File

    const validRecords = result.data; // Validirani podaci su u 'data' svojstvu
    const invalidRecordErrors = result.errors; // Poruke grešaka su u 'errors' svojstvu
    const importedCount = result.validRows; // Broj validnih redova (onih koji će biti uvezeni)
    const failedCount = result.invalidRows; // Broj nevalidnih redova (redova sa greškama)


    // PROVERA ISPRAVLJENA: Proveri da li ima validnih zapisa ZA UVOZ
    if (validRecords.length === 0) {
         // Ako nema validnih zapisa za uvoz, baci grešku.
         // Dodajemo i detalje o validacionim greškama ako ih ima.
         const errorMessage = invalidRecordErrors.length > 0
            ? `No valid records found in the CSV file. ${invalidRecordErrors.length} records had validation or parsing errors.`
            : "CSV file is empty or contains no data.";
         throw new Error(errorMessage);
    }


    // Kreiraj bulk services u bazi
    const createdRecords = await db.$transaction(
      validRecords.map(record =>
        db.bulkService.create({
          data: {
            ...record,
            // Pretpostavlja se da 'record' sada sadrži providerId i serviceId
            // nakon što ih je mapBulkServiceData dodao u processBulkServiceImport
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        })
      )
    );

    // Log activity - KORIŠĆENI ISPRAVNI BROJEVI
    await ActivityLogService.log({
      action: "IMPORT_BULK_SERVICES",
      entityType: "BULK_SERVICE",
      entityId: null, // Možeš i ostaviti null ili logovati ukupan broj pokušaja ili uvezenih
      details: `Imported ${createdRecords.length} bulk services. ${failedCount} records had validation errors.`, // Koristi ispravne brojače grešaka
      severity: LogSeverity.INFO,
      userId: currentUser.id,
    });

    // Revalidate the bulk services list page
    revalidatePath("/bulk-services");

    // VRAĆENA ISPRAVNA STRUKTURA REZULTATA
    return {
      success: failedCount === 0, // Uspeh samo ako NEMA nevalidnih redova
      imported: createdRecords.length, // Broj uspešno kreiranih zapisa
      failed: failedCount, // Broj redova sa greškama validacije
      invalidRecords: invalidRecordErrors,
    };
  } catch (error) {
    console.error("[IMPORT_BULK_SERVICES_ERROR]", error); // Promenjen naziv za log greške

    // Baci standardizovanu ServerError
    if (error instanceof ServerError) {
        throw error; // Ako je već ServerError, baci je direktno
    } else if (error instanceof Error) {
        throw new ServerError(`Failed to import bulk services: ${error.message}`); // Baci novu ServerError sa porukom originalne greške
    } else {
         throw new ServerError("Failed to import bulk services: An unknown error occurred."); // Generička greška za nepoznate tipove
    }
  }
}