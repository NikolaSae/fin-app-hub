// /actions/contracts/acknowledge-reminder.ts
'use server';

import { db } from '@/lib/db'; // Pretpostavljena putanja do vašeg Prisma klijenta
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth'; // Pretpostavljena putanja do vašeg auth helpera
import { z } from 'zod'; // Koristimo Zod za osnovnu validaciju ID-ja

// Šema za validaciju ID-ja podsetnika
const AcknowledgeReminderSchema = z.object({
  reminderId: z.string().cuid("Invalid reminder ID format"), // Pretpostavka da koristite CUIDs
});

/**
 * Označava podsetnik ugovora kao pregledan.
 * @param values - Objekat koji sadrži reminderId.
 * @returns Uspeh/neuspeh operacije i, u slučaju uspeha, podatke o ažuriranom podsetniku.
 */
export const acknowledgeContractReminder = async (values: z.infer<typeof AcknowledgeReminderSchema>) => {
  // 1. Validacija ulaznih podataka
  const validatedFields = AcknowledgeReminderSchema.safeParse(values);

  if (!validatedFields.success) {
    console.error("Validation failed:", validatedFields.error.errors);
    return { error: "Invalid input fields!" };
  }

  const { reminderId } = validatedFields.data;

  // 2. Dobijanje ID-a trenutnog korisnika
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    // 3. Provera da li podsetnik postoji i da nije već pregledan
    const existingReminder = await db.contractReminder.findUnique({
      where: { id: reminderId },
    });

    if (!existingReminder) {
      return { error: "Reminder not found." };
    }

    if (existingReminder.isAcknowledged) {
        return { success: "Reminder already acknowledged.", reminder: existingReminder };
    }

    // 4. Ažuriranje podsetnika
    const updatedReminder = await db.contractReminder.update({
      where: { id: reminderId },
      data: {
        isAcknowledged: true,
        acknowledgedById: userId,
      },
    });

    // 5. Revalidacija cache-a
    // Revalidiramo stranicu detalja ugovora na koji se podsetnik odnosi
    revalidatePath(`/app/(protected)/contracts/${updatedReminder.contractId}`);
    // Opciono: Revalidirati i stranicu/komponentu gde se prikazuju podsetnici/notifikacije
    // revalidatePath('/app/(protected)/reminders');
    // revalidatePath('/app/(protected)/notifications');


    return { success: "Reminder acknowledged successfully!", reminder: updatedReminder };

  } catch (error) {
    console.error(`Error acknowledging reminder ${reminderId}:`, error);
    // Generalna greška servera
    return { error: "Failed to acknowledge reminder." };
  }
};