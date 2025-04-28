// /actions/products/delete.ts
'use server';

import { db } from '@/lib/db';
// Uvozimo auth funkcije za proveru autentifikacije/autorizacije
import { auth } from '@/auth';
import { currentRole } from "@/lib/auth";
import { UserRole } from "@prisma/client"; // Koristimo UserRole enum iz Prisma klijenta
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'; // Uvozimo specifičan tip Prisma greške


/**
 * Server akcija za brisanje proizvoda.
 * Usklađena sa Product modelom u schema.prisma i njegovim relacijama.
 * @param id - ID proizvoda koji se briše.
 * @returns Objekat sa statusom uspeha/neuspeha ili greškom.
 */
export async function deleteProduct(id: string): Promise<{ success?: string; error?: string }> {
    // Provera autorizacije - samo ADMIN može brisati proizvode (ili viša uloga)
     const role = await currentRole();
     // Možda samo ADMIN može brisati, a MANAGER samo ažurirati? Prilagodite uloge.
     if (role !== UserRole.ADMIN) {
       return { error: "Forbidden" };
     }

    try {
        // 1. Provera da li proizvod postoji pre brisanja (opciono, ali dobra praksa)
        // Prisma delete će baciti P2025 grešku ako record ne postoji, što se može uhvatiti dole
        // const existingProduct = await db.product.findUnique({
        //     where: { id },
        // });
        // if (!existingProduct) {
        //     return { error: "Product not found." };
        // }


        // 2. Brisanje proizvoda iz baze
        await db.product.delete({
            where: { id },
        });

        // 3. Vraćanje uspešnog odgovora
        return { success: "Product deleted successfully!" };

    } catch (error) {
        console.error(`Error deleting product with ID ${id}:`, error);
        // Rukovanje specifičnim Prisma greškama
        if (error instanceof PrismaClientKnownRequestError) {
            // P2025: An operation failed because it depends on one or more records that were required but not found. (Record to delete does not exist)
            if (error.code === 'P2025') {
                 // const target = (error.meta as any)?.target; // Može dati više info
                 return { error: `Product with ID ${id} not found.` };
            }
            // P2003: Foreign key constraint failed on the database. (Cannot delete because it's referenced elsewhere)
            if (error.code === 'P2003') {
                 // const field_name = (error.meta as any)?.field_name; // Može dati ime polja koje krši constraint
                 return { error: `Cannot delete product because it is associated with other records (e.g., complaints). Please remove associated records first.` };
            }
            // Rukovanje drugim poznatim Prisma greškama ako je potrebno
        }


        // Vraćanje generičke greške za nepoznate greške
        return { error: "Failed to delete product." };
    }
}