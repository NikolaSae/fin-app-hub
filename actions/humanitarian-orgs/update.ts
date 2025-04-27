// /actions/humanitarian-orgs/update.ts
'use server';

// Uvozimo potrebne module
import { db } from '@/lib/db'; // Pretpostavljena putanja do vašeg Prisma klijenta
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth'; // Pretpostavljena putanja do vašeg auth helpera
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'; // Za rukovanje specifičnim Prisma greškama
// Uvozimo Zod šemu i tip forme
import { humanitarianOrgSchema, HumanitarianOrgFormData } from '@/schemas/humanitarian-org';


/**
 * Server akcija za ažuriranje postojeće humanitarne organizacije.
 * @param id - ID organizacije za ažuriranje.
 * @param values - Podaci forme za ažuriranje organizacije.
 * @returns Objekat sa success/error porukom i, u slučaju uspeha, ID ažurirane organizacije.
 */
export const updateHumanitarianOrg = async (id: string, values: HumanitarianOrgFormData) => {
    // 1. Validacija ulaznih podataka pomoću Zod šeme
    const validatedFields = humanitarianOrgSchema.safeParse(values);

    if (!validatedFields.success) {
        console.error("Validation failed:", validatedFields.error.errors);
        // Vraćamo formatirane greške validacije
        return { error: "Invalid fields!", details: validatedFields.error.format() };
    }

    // Izdvajamo validirane podatke
     const {
        name,
        contactPerson,
        email,
        phone,
        address,
        website,
        mission,
        isActive,
    } = validatedFields.data;

     // 2. Provera autorizacije (opciono)
     // const session = await auth();
     // if (!session?.user || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
     //   return { error: "Unauthorized" };
     // }

    try {
         // 3. Provera da li organizacija sa datim ID-em postoji
         const existingOrganization = await db.humanitarianOrg.findUnique({
             where: { id },
         });

         if (!existingOrganization) {
             return { error: "Humanitarian organization not found." };
         }

         // 4. Opciono: Provera jedinstvenosti ako se menja polje koje treba biti jedinstveno (npr. ime ili email)
         const orgWithSameName = await db.humanitarianOrg.findFirst({
              where: {
                  name: name,
                  id: { not: id }, // Isključi trenutnu organizaciju
              },
         });
         if (orgWithSameName) {
              return { error: `Another organization with name "${name}" already exists.` };
         }
         // Ako email mora biti jedinstven i menja se
          if (email && email !== existingOrganization.email) {
              const orgWithSameEmail = await db.humanitarianOrg.findUnique({
                 where: { email: email },
              });
              if (orgWithSameEmail) {
                  return { error: `Another organization with email "${email}" already exists.` };
              }
          }


        // 5. Ažuriranje humanitarne organizacije u bazi
        const updatedOrganization = await db.humanitarianOrg.update({
            where: { id },
            data: {
                name,
                contactPerson,
                email,
                phone,
                address,
                website,
                mission,
                isActive,
                // updatedAt se postavlja automatski
                // lastModifiedById: session?.user?.id, // Popunite ID korisnika
            },
        });

        // 6. Revalidacija cache-a
        revalidatePath('/app/(protected)/humanitarian-orgs'); // Lista
        revalidatePath(`/app/(protected)/humanitarian-orgs/${id}`); // Stranica detalja
        revalidatePath(`/app/(protected)/humanitarian-orgs/${id}/edit`); // Stranica editovanja

        return { success: "Humanitarian organization updated successfully!", id: updatedOrganization.id };

    } catch (error) {
        console.error(`Error updating humanitarian organization ${id}:`, error);
         // Rukovanje specifičnim greškama baze
         if (error instanceof PrismaClientKnownRequestError) {
              if (error.code === 'P2002') {
                 // Detaljnije rukovanje greškom Unique constraint-a
                  return { error: "An organization with similar details already exists." };
              }
         }
        return { error: "Failed to update humanitarian organization." }; // Generalna greška servera
    }
};