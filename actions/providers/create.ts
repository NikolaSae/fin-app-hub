// /actions/providers/create.ts
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


/**
 * Server akcija za kreiranje novog provajdera.
 * @param values - Podaci forme za kreiranje provajdera.
 * @returns Objekat sa success/error porukom i, u slučaju uspeha, ID novog provajdera.
 */
export const createProvider = async (values: ProviderFormData) => { // Koristimo uvezeni tip
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
        // 3. Opciono: Provera jedinstvenosti (ako je potrebno)
        // const existingProvider = await db.provider.findUnique({
        //     where: { name: name }, // Primer provere po imenu
        // });
        // if (existingProvider) {
        //     return { error: "Provider with this name already exists." };
        // }


        // 4. Kreiranje provajdera u bazi
        const newProvider = await db.provider.create({
            data: {
                name,
                contactName,
                email,
                phone,
                address,
                isActive,
            },
        });

        // 5. Revalidacija cache-a
        revalidatePath('/app/(protected)/providers');

        return { success: "Provider created successfully!", id: newProvider.id };

    } catch (error) {
        console.error("Error creating provider:", error);
        // Rukovanje specifičnim greškama baze
        // if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        //     return { error: "A provider with this name already exists." };
        // }
        return { error: "Failed to create provider." };
    }
};