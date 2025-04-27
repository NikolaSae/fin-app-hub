// /actions/contracts/create-reminder.ts
'use server';

import { db } from '@/lib/db'; // Pretpostavljena putanja do vašeg Prisma klijenta
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth'; // Pretpostavljena putanja do vašeg auth helpera
import { validateContractReminder } from '@/lib/contracts/validators'; // Validacioni fajl koji već postoji
import { z } from 'zod'; // Koristimo Zod za osnovnu validaciju ID-ja i datuma/tipa

// Osnovna šema za validaciju ulaznih podataka
const CreateReminderSchema = z.object({
  contractId: z.string().cuid("Invalid contract ID format"),
  reminderDate: z.string().transform((val) => new Date(val)), // Validacija datuma
  reminderType: z.string().min(1, "Reminder type is required"),
  // Opciono: validacija reminderType enuma ako je potrebno
  // reminderType: z.enum(["expiration", "renewal", "review"], {
  //   errorMap: () => ({ message: "Invalid reminder type" }),
  // }),
});


/**
 * Kreira novi podsetnik za ugovor.
 * @param values - Objekat koji sadrži contractId, reminderDate (kao string) i reminderType.
 * @returns Uspeh/neuspeh operacije i, u slučaju uspeha, podatke o kreiranom podsetniku.
 */
export const createContractReminder = async (values: z.infer<typeof CreateReminderSchema>) => {
  // 1. Validacija ulaznih podataka
  const validatedFields = CreateReminderSchema.safeParse(values);

  if (!validatedFields.success) {
    console.error("Validation failed:", validatedFields.error.errors);
    return { error: "Invalid input fields!" };
  }

  const { contractId, reminderDate, reminderType } = validatedFields.data;

  // 2. Dobijanje ID-a trenutnog korisnika (opciono, za logovanje/audit, ali ne čuva se na modelu Reminder)
  const session = await auth();
  const userId = session?.user?.id;

   if (!userId) {
     // Opciono: provera autorizacije
     // return { error: "Unauthorized" };
   }

  // 3. Dodatna validacija poslovne logike koristeći utility funkciju
  // Note: validateContractReminder utility prihvata Date objekte
  const businessValidation = validateContractReminder(reminderDate, reminderType);

   if (!businessValidation.success) {
        return { error: businessValidation.errors?.join(', ') || "Reminder validation failed." };
   }


  try {
    // 4. Provera da li ugovor postoji
    const existingContract = await db.contract.findUnique({
      where: { id: contractId },
    });

    if (!existingContract) {
      return { error: "Contract not found." };
    }

    // 5. Kreiranje ContractReminder zapisa u bazi podataka
    const newReminder = await db.contractReminder.create({
      data: {
        contractId: contractId,
        reminderDate: reminderDate, // Validated and transformed Date object
        reminderType: reminderType,
        // isAcknowledged će biti false po defaultu
        // acknowledgedById je null po defaultu
      },
    });

    // 6. Revalidacija cache-a za stranicu detalja ugovora
    revalidatePath(`/app/(protected)/contracts/${contractId}`);
    // Opciono: revalidirati i listu podsetnika komponentu ako je odvojena ruta

    return { success: "Reminder created successfully!", reminder: newReminder };

  } catch (error) {
    console.error(`Error creating reminder for contract ${contractId}:`, error);
    // Generalna greška servera
    return { error: "Failed to create reminder." };
  }
};