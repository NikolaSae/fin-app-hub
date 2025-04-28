// /actions/providers/create.ts
'use server';

import { db } from '@/lib/db'; // Assuming this is the path to your Prisma client
import { providerSchema, ProviderFormData } from '@/schemas/provider'; // Assuming this is the path to your schema and types
import { revalidatePath } from 'next/cache';

/**
 * Server Action to create a new provider.
 * Validates input data using Zod schema.
 * @param data - Provider data from the form.
 * @returns A result object indicating success or error.
 */
export async function createProvider(data: ProviderFormData): Promise<{ success?: string; id?: string; error?: string; details?: any }> {
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
        // Check if a provider with the same name already exists (case-insensitive)
        const existingProvider = await db.provider.findFirst({
            where: {
                name: {
                    equals: validatedData.name,
                    mode: 'insensitive', // Case-insensitive check
                },
            },
        });

        if (existingProvider) {
            return { error: `Provider with name "${validatedData.name}" already exists.` };
        }

        // Create the provider in the database
        const provider = await db.provider.create({
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
         // Revalidate cache for the new provider's detail page
         revalidatePath(`/providers/${provider.id}`);


        return { success: 'Provider created successfully.', id: provider.id };

    } catch (error) {
        console.error("Error creating provider:", error);
        // Check for unique constraint errors if needed
        // if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') { ... }
        return { error: 'Failed to create provider.' };
    }
}