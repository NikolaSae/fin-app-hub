// /actions/providers/delete.ts
'use server';

import { db } from '@/lib/db'; // Pretpostavljena putanja do vašeg Prisma klijenta
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth'; // Pretpostavljena putanja do vašeg auth helpera
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'; // Za rukovanje specifičnim Prisma greškama

/**
 * Server akcija za brisanje provajdera.
 * @param id - ID provajdera za brisanje.
 * @returns Objekat sa success/error porukom.
 */
export const deleteProvider = async (id: string) => {
    // 1. Provera autorizacije (opciono, npr. samo ADMIN može brisati provajdere)
    // const session = await auth();
    // if (!session?.user || session.user.role !== 'ADMIN') {
    //   return { error: "Unauthorized" };
    // }

    try {
         // 2. Provera da li provajder sa datim ID-em postoji
         const existingProvider = await db.provider.findUnique({
             where: { id },
         });

         if (!existingProvider) {
             return { error: "Provider not found." };
         }

        // 3. Brisanje provajdera u bazi
        // Zavisno od onDelete podešavanja u vašoj Prisma šemi za relacije (ugovori, servisi, reklamacije),
        // brisanje može automatski obrisati povezane zapise (Cascade), postaviti ih na null (SetNull),
        // ili pući sa greškom (Restrict). Rukujemo potencijalnom 'Restrict' greškom.
        await db.provider.delete({
            where: { id },
        });

        // 4. Revalidacija cache-a za relevantne stranice
        revalidatePath('/app/(protected)/providers'); // Lista provajdera
        // Revalidirajte i druge stranice koje bi mogle prikazati ovog provajdera (npr. detalje ugovora)
        // revalidatePath('/app/(protected)/contracts');


        return { success: "Provider deleted successfully!" };

    } catch (error) {
        console.error(`Error deleting provider ${id}:`, error);
        // Rukovanje specifičnim greškama (npr. foreign key constraint - ako je onDelete: Restrict)
        if (error instanceof PrismaClientKnownRequestError) {
             if (error.code === 'P2003') { // Foreign key constraint violation
                return { error: "Cannot delete provider because it is associated with existing contracts, services, or complaints." };
             }
             // Rukovanje drugim poznatim Prisma greškama ako je potrebno
            // return { error: `Database error: ${error.message}` };
        }
        return { error: "Failed to delete provider." }; // Generalna greška servera
    }
};