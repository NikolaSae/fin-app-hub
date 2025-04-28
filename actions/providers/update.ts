// /actions/providers/update.ts
'use server';

import { db } from '@/lib/db'; // Assuming this is the path to your Prisma client
import { providerSchema, ProviderFormData } from '@/schemas/provider'; // Assuming this is the path to your schema and types
import { revalidatePath } from 'next/cache';

/**
 * Server Action to update an existing provider.
 * Validates input data using Zod schema.
 * @param id - The ID of the provider to update.
 * @param data - Updated provider data from the form.
 * @returns A result object indicating success or error.
 */
export async function updateProvider(id: string, data: ProviderFormData): Promise<{ success?: string; id?: string; error?: string; details?: any }> {
    // Validate input data using the Zod schema
    const validationResult = providerSchema.safeParse(data);

    if (!validationResult.success) {
        // If validation fails, return a detailed error
        return {
            error: 'Validation failed.',
            details: validationResult.error.format(), // Return formatted Zod errors
        };
    }

    const validatedData = validationResult.data;

    try {
        // Check if the provider exists
        const existingProvider = await db.provider.findUnique({
            where: { id },
        });

        if (!existingProvider) {
            return { error: 'Provider not found.' };
        }

         // Check if a provider with the same name already exists (case-insensitive),
         // but exclude the current provider being updated.
         const duplicateProvider = await db.provider.findFirst({
             where: {
                 name: {
                     equals: validatedData.name,
                     mode: 'insensitive',
                 },
                 NOT: { id }, // Exclude the current provider
             },
         });

         if (duplicateProvider) {
             return { error: `Provider with name "${validatedData.name}" already exists.` };
         }


        // Update the provider in the database
        const provider = await db.provider.update({
            where: { id },
            data: {
                name: validatedData.name,
                contactName: validatedData.contactName || null, // Store empty string as null in DB
                email: validatedData.email || null,
                phone: validatedData.phone || null,
                address: validatedData.address || null,
                isActive: validatedData.isActive,
            },
        });

        // Revalidate cache for the providers list page
        revalidatePath('/providers');
         // Revalidate cache for this provider's detail page
         revalidatePath(`/providers/${provider.id}`);


        return { success: 'Provider updated successfully.', id: provider.id };

    } catch (error) {
        console.error(`Error updating provider with ID ${id}:`, error);
        // Check for unique constraint errors if needed (e.g., on name if unique)
        // if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') { ... }
        return { error: 'Failed to update provider.' };
    }
}