// /actions/providers/update.ts
'use server';

// Uklanjamo placeholder Zod šemu i tip
// import { z } from 'zod'; // Uklonjeno ako se ne koristi direktno
// const providerSchema: any = z.object({ ... }); // Uklonjeno
// interface ProviderFormData { ... } // Uklonjeno

// Uvozimo stvarnu Zod šemu i TypeScript tipove za provajdere
import { providerSchema, ProviderFormData } from '@/schemas/provider';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';


/**
 * Server akcija za ažuriranje postojećeg provajdera.
 * @param id - ID provajdera za ažuriranje.
 * @param values - Podaci forme za ažuriranje provajdera.
 * @returns Objekat sa success/error porukom i, u slučaju uspeha, ID ažuriranog provajdera.
 */
export const updateProvider = async (id: string, values: ProviderFormData) => { // Koristimo uvezeni tip
    // 1. Validacija ulaznih podataka pomoću STVARNE šeme
    const validatedFields = providerSchema.safeParse(values);

    if (!validatedFields.success) {
        console.error("Validation failed:", validatedFields.error.errors);
        // Vraćamo formatirane greške validacije
        return { error: "Invalid fields!", details: validatedFields.error.format() };
    }

     const {
        name,
        contactName,
        email,
        phone,
        address,
        isActive,
    } = validatedFields.data;

     // 2. Provera autorizacije (opciono)
     // const session = await auth();
     // if (!session?.user || session.user.role !== 'ADMIN') {
     //   return { error: "Unauthorized" };
     // }

    try {
         // 3. Provera da li provajder sa datim ID-em postoji
         const existingProvider = await db.provider.findUnique({
             where: { id },
         });

         if (!existingProvider) {
             return { error: "Provider not found." };
         }

         // 4. Opciono: Provera jedinstvenosti ako se menja polje koje treba biti jedinstveno
         // const providerWithSameName = await db.provider.findFirst({
         //      where: {
         //          name: name,
         //          id: { not: id },
         //      },
         // });
         // if (providerWithSameName) {
         //      return { error: "Another provider with this name already exists." };
         // }


        // 5. Ažuriranje provajdera u bazi
        const updatedProvider = await db.provider.update({
            where: { id },
            data: {
                name,
                contactName,
                email,
                phone,
                address,
                isActive,
            },
        });

        // 6. Revalidacija cache-a
        revalidatePath('/app/(protected)/providers');
        revalidatePath(`/app/(protected)/providers/${id}`);
        revalidatePath(`/app/(protected)/providers/${id}/edit`);

        return { success: "Provider updated successfully!", id: updatedProvider.id };

    } catch (error) {
        console.error(`Error updating provider ${id}:`, error);
         // Rukovanje specifičnim greškama baze
         if (error instanceof PrismaClientKnownRequestError) {
              if (error.code === 'P2002') {
                  return { error: "Another provider with this name already exists." };
              }
         }
        return { error: "Failed to update provider." };
    }
};