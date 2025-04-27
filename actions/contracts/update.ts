// /actions/contracts/update.ts
'use server';

import { z } from 'zod';
import { db } from '@/lib/db'; // Pretpostavljena putanja do vašeg Prisma klijenta
import { contractSchema } from '@/schemas/contract'; // Ovaj fajl ćemo kreirati kasnije
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth'; // Pretpostavljena putanja do vašeg auth helpera
import { ContractFormData } from '@/lib/types/contract-types'; // Ovaj fajl ćemo kreirati kasnije

export const updateContract = async (id: string, values: ContractFormData) => {
  // 1. Validacija ulaznih podataka pomoću Zod šeme
  const validatedFields = contractSchema.safeParse(values);

  if (!validatedFields.success) {
    console.error("Validation failed:", validatedFields.error.errors);
    return { error: "Invalid fields!", details: validatedFields.error.format() };
  }

  const {
    name,
    contractNumber, // Ne dozvoljavamo promenu contractNumber-a nakon kreiranja
    type, // Ne dozvoljavamo promenu tipa nakon kreiranja
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

    // 3. Provera da li ugovor postoji
    const existingContract = await db.contract.findUnique({
      where: { id },
      include: {
        services: true, // Učitavamo postojeće ServiceContract unose
      }
    });

    if (!existingContract) {
      return { error: "Contract not found." };
    }

    // Provera da li korisnik pokušava da promeni tip ili broj ugovora (ako to nije dozvoljeno)
    if (existingContract.contractNumber !== contractNumber || existingContract.type !== type) {
       // Ovo bi trebalo da bude sprečeno na klijentskoj strani u formi,
       // ali je dobra praksa imati i validaciju na serveru za svaki slučaj.
       // Zavisno od poslovne logike, možda dozvoljavate neke promene.
       // Trenutna implementacija forme ne dozvoljava promenu type i contractNumber.
       // Ako je potrebno, dodajte ovde logiku za proveru i vraćanje greške.
    }


    // 4. Ažuriranje relacije sa servisima (ServiceContract many-to-many)
    // Upoređujemo postojeće servise sa novim nizom ID-jeva
    const existingServiceIds = existingContract.services.map(sc => sc.serviceId);
    const servicesToAdd = services?.filter(serviceId => !existingServiceIds.includes(serviceId)) || [];
    const servicesToRemove = existingServiceIds.filter(serviceId => !services?.includes(serviceId)) || [];

    // Transakcija za sigurno ažuriranje (brisanje pa dodavanje)
    await db.$transaction([
        // Uklanjanje servisa koji više nisu u novom spisku
        ...servicesToRemove.map(serviceId =>
            db.serviceContract.deleteMany({
                where: {
                    contractId: id,
                    serviceId: serviceId,
                },
            })
        ),
        // Dodavanje novih servisa
        ...servicesToAdd.map(serviceId =>
             db.serviceContract.create({
                data: {
                    contractId: id,
                    serviceId: serviceId,
                    // Ovde možete dodati podrazumevane ili prazne specificTerms ako je potrebno
                },
            })
        ),
         // Ažuriranje glavnog Contract zapisa
        db.contract.update({
            where: { id },
            data: {
                name,
                status,
                startDate,
                endDate,
                revenuePercentage,
                description,
                providerId, // Ovi ID-jevi će biti null ako tip nije relevantan (validated by Zod schema)
                humanitarianOrgId,
                parkingServiceId,
                lastModifiedById: userId, // Povezivanje modifikatora
            },
        })
    ]);


    // 5. Revalidacija cache-a za relevantne stranice
    revalidatePath('/app/(protected)/contracts'); // Lista svih ugovora
    revalidatePath(`/app/(protected)/contracts/${id}`); // Stranica detalja ugovora
    revalidatePath(`/app/(protected)/contracts/${id}/edit`); // Stranica za editovanje (možda nije neophodno revalidirati edit stranicu direktno, ali ne škodi)
     revalidatePath('/app/(protected)/contracts/expiring'); // Opciono, ako promena datuma utiče na ovu listu

    return { success: "Contract updated successfully!", id: id };

  } catch (error) {
    console.error("Error updating contract:", error);
    // Generalna greška servera
    return { error: "Failed to update contract." };
  }
};