// /actions/humanitarian-orgs/delete.ts
'use server';

// Uvozimo potrebne module
import { db } from '@/lib/db'; // Pretpostavljena putanja do vašeg Prisma klijenta
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth'; // Pretpostavljena putanja do vašeg auth helpera
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'; // Za rukovanje specifičnim Prisma greškama


/**
 * Server akcija za brisanje humanitarne organizacije.
 * @param id - ID organizacije za brisanje.
 * @returns Objekat sa success/error porukom.
 */
export const deleteHumanitarianOrg = async (id: string) => {
    // 1. Provera autorizacije (opciono, npr. samo ADMIN može brisati)
    // const session = await auth();
    // if (!session?.user || session.user.role !== 'ADMIN') {
    //   return { error: "Unauthorized" };
    // }

    try {
         // 2. Provera da li organizacija sa datim ID-em postoji
         const existingOrganization = await db.humanitarianOrg.findUnique({
             where: { id },
         });

         if (!existingOrganization) {
             return { error: "Humanitarian organization not found." };
         }

        // 3. Brisanje organizacije u bazi
        // Zavisno od onDelete podešavanja u vašoj Prisma šemi za relacije (ugovori, reklamacije, obnove),
        // brisanje može automatski obrisati povezane zapise (Cascade), postaviti ih na null (SetNull),
        // ili pući sa greškom (Restrict). Rukujemo potencijalnom 'Restrict' greškom.
        await db.humanitarianOrg.delete({
            where: { id },
        });

        // 4. Revalidacija cache-a za relevantne stranice
        revalidatePath('/app/(protected)/humanitarian-orgs'); // Lista organizacija
        // Revalidirajte i druge stranice koje bi mogle prikazati ovu organizaciju

        return { success: "Humanitarian organization deleted successfully!" };

    } catch (error) {
        console.error(`Error deleting humanitarian organization ${id}:`, error);
        // Rukovanje specifičnim greškama (npr. foreign key constraint - ako je onDelete: Restrict)
        if (error instanceof PrismaClientKnownRequestError) {
             if (error.code === 'P2003') { // Foreign key constraint violation
                return { error: "Cannot delete humanitarian organization because it is associated with existing contracts, complaints, or renewals." };
             }
             // Rukovanje drugim poznatim Prisma greškama ako je potrebno
        }
        return { error: "Failed to delete humanitarian organization." }; // Generalna greška servera
    }
};