// /actions/humanitarian-orgs/create.ts
'use server';

// Uvozimo potrebne module
import { db } from '@/lib/db'; // Pretpostavljena putanja do vašeg Prisma klijenta
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth'; // Pretpostavljena putanja do vašeg auth helpera
// Uvozimo Zod šemu i tip forme
import { humanitarianOrgSchema, HumanitarianOrgFormData } from '@/schemas/humanitarian-org';


/**
 * Server akcija za kreiranje nove humanitarne organizacije.
 * @param values - Podaci forme za kreiranje organizacije.
 * @returns Objekat sa success/error porukom i, u slučaju uspeha, ID nove organizacije.
 */
export const createHumanitarianOrg = async (values: HumanitarianOrgFormData) => {
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
        contactName,
        email,
        phone,
        address,
        website,
        mission,
        isActive,
    } = validatedFields.data;

     // 2. Provera autorizacije (opciono, npr. samo ADMIN ili MANAGER može kreirati organizacije)
        const session = await auth();
       if (!session?.user || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
         return { error: "Unauthorized" };
       }

    try {
        // 3. Opciono: Provera jedinstvenosti (npr. po imenu ili emailu ako treba)
        const existingOrgByName = await db.humanitarianOrg.findUnique({
            where: { name: name },
        });
        if (existingOrgByName) {
            return { error: `Organization with name "${name}" already exists.` };
        }
         // Ako email mora biti jedinstven
         if (email) {
            const existingOrgByEmail = await db.humanitarianOrg.findFirst({
                where: { email: email },
            });
            if (existingOrgByEmail) {
                // handle duplicate email error
            }
        }


        // 4. Kreiranje humanitarne organizacije u bazi
        const newOrganization = await db.humanitarianOrg.create({
            data: {
                name,
                contactName,
                email,
                phone,
                address,
                website,
                mission,
                isActive,
                // createdAt i updatedAt se postavljaju automatski
                // createdById: session?.user?.id, // Popunite ID korisnika ako koristite audit polja
            },
        });

        // 5. Revalidacija cache-a za stranice sa organizacijama
        revalidatePath('/app/(protected)/humanitarian-orgs'); // Lista organizacija
        // Možda revalidirati i druge stranice koje prikazuju hum. org. (npr. forme za ugovore/reklamacije)

        return { success: "Humanitarian organization created successfully!", id: newOrganization.id };

    } catch (error) {
        console.error("Error creating humanitarian organization:", error);
        // Rukovanje specifičnim greškama baze (npr. Unique constraint violation)
        // if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        //     // Detaljnije rukovanje greškom Unique constraint-a ako postoji više takvih polja
        //     return { error: "An organization with similar details already exists." };
        // }
        return { error: "Failed to create humanitarian organization." }; // Generalna greška servera
    }
};