// /actions/contracts/delete.ts
'use server';

import { db } from '@/lib/db'; // Pretpostavljena putanja do vašeg Prisma klijenta
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth'; // Pretpostavljena putanja do vašeg auth helpera

export const deleteContract = async (id: string) => {
  // 1. Dobijanje ID-a trenutnog korisnika (opciono, za logovanje/audit)
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
     // Opciono: provera autorizacije, npr. samo ADMIN ili MANAGER može brisati
     // return { error: "Unauthorized" };
  }

  try {
    // 2. Provera da li ugovor postoji pre brisanja (opciono, deleteMany ne baca grešku ako ne nađe)
    // Ali je bolje dati informativniju poruku ako id ne postoji.
    const existingContract = await db.contract.findUnique({
      where: { id },
    });

    if (!existingContract) {
      return { error: "Contract not found." };
    }

    // 3. Brisanje ugovora
    // Zahvaljujući onDelete: Cascade u Prisma šemi, povezani ServiceContract,
    // ContractAttachment i ContractReminder zapisi će takođe biti obrisani.
    await db.contract.delete({
      where: { id },
    });

    // 4. Revalidacija cache-a za stranice sa ugovorima
    revalidatePath('/app/(protected)/contracts');
    // Možda ćete želeti da revalidirate i druge rute ako brisanje utiče na njihove liste
    // npr. revalidatePath('/app/(protected)/contracts/expiring');

    return { success: "Contract deleted successfully!" };

  } catch (error) {
    console.error(`Error deleting contract with ID ${id}:`, error);
    // Proveriti tip greške ako je potrebno za specifičnije poruke
    return { error: "Failed to delete contract." };
  }
};