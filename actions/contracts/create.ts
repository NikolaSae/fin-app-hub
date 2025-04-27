// /actions/contracts/create.ts
'use server';

import { z } from 'zod';
import { db } from '@/lib/db'; // Pretpostavljena putanja do vašeg Prisma klijenta
import { contractSchema } from '@/schemas/contract'; // Ovaj fajl ćemo kreirati kasnije
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth'; // Pretpostavljena putanja do vašeg auth helpera
import { ContractFormData } from '@/lib/types/contract-types'; // Ovaj fajl ćemo kreirati kasnije

export const createContract = async (values: ContractFormData) => {
  // 1. Validacija ulaznih podataka pomoću Zod šeme
  const validatedFields = contractSchema.safeParse(values);

  if (!validatedFields.success) {
    console.error("Validation failed:", validatedFields.error.errors);
    return { error: "Invalid fields!", details: validatedFields.error.format() };
  }

  const {
    name,
    contractNumber,
    type,
    status,
    startDate,
    endDate,
    revenuePercentage,
    description,
    providerId,
    humanitarianOrgId,
    parkingServiceId,
    services, // Ovo će biti niz ID-jeva servisa
  } = validatedFields.data;

  try {
    // 2. Dobijanje ID-a trenutnog korisnika
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { error: "Unauthorized" };
    }

    // 3. Provera jedinstvenosti broja ugovora
    const existingContract = await db.contract.findUnique({
      where: { contractNumber: contractNumber },
    });

    if (existingContract) {
      return { error: "Contract number already exists!" };
    }

    // 4. Kreiranje ugovora u bazi podataka
    const newContract = await db.contract.create({
      data: {
        name,
        contractNumber,
        type,
        status,
        startDate,
        endDate,
        revenuePercentage,
        description,
        providerId,
        humanitarianOrgId,
        parkingServiceId,
        createdById: userId, // Povezivanje kreatora

        // Povezivanje servisa kroz ServiceContract model
        services: {
          create: services?.map(serviceId => ({
            serviceId: serviceId,
            // Ovde možete dodati podrazumevane ili prazne specificTerms ako je potrebno
          })),
        },
      },
    });

    // 5. Revalidacija cache-a za stranice sa ugovorima
    revalidatePath('/app/(protected)/contracts');
    revalidatePath('/app/(protected)/contracts/expiring'); // Opciono, ako kreiranje novog ugovora može uticati na ovu listu

    return { success: "Contract created successfully!", id: newContract.id };

  } catch (error) {
    console.error("Error creating contract:", error);
    // Generalna greška servera
    return { error: "Failed to create contract." };
  }
};