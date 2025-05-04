// Path: /actions/contracts/create.ts
'use server';

import { db } from '@/lib/db';
import { contractSchema } from '@/schemas/contract';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import type { ContractFormData } from '@/schemas/contract';

export async function createContract(data: ContractFormData) {
  try {
    // Format dates properly if they exist but are not in ISO format
    const formattedData = {
      ...data,
      // Ensure dates are in proper ISO format or null if not provided
      startDate: data.startDate ? new Date(data.startDate).toISOString() : null, // Koristite null umesto undefined za Prisma
      endDate: data.endDate ? new Date(data.endDate).toISOString() : null, // Koristite null umesto undefined za Prisma
      // Clean up foreign keys based on contract type
      providerId: data.type === 'PROVIDER' ? data.providerId : null,
      humanitarianOrgId: data.type === 'HUMANITARIAN' ? data.humanitarianOrgId : null,
      parkingServiceId: data.type === 'PARKING' ? data.parkingServiceId : null,
    };

    // Validate input data
    const validationResult = contractSchema.safeParse(formattedData);
    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error.flatten()); // Log validation errors server-side
      return {
        error: "Validation failed",
        details: validationResult.error.flatten(),
        success: false // Dodajte success: false za konzistentnost
      };
    }

    // Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized", success: false }; // Dodajte success: false
    }

    // Check for existing contract number
    const existingContract = await db.contract.findUnique({
      where: { contractNumber: formattedData.contractNumber },
    });
    if (existingContract) {
       console.warn(`Attempted to create duplicate contract number: ${formattedData.contractNumber}`); // Log warning server-side
      return { error: "Contract number already exists", success: false }; // Dodajte success: false
    }

    // Create contract with relations
    const contractData = {
      name: formattedData.name,
      contractNumber: formattedData.contractNumber,
      type: formattedData.type,
      status: formattedData.status,
      startDate: formattedData.startDate,
      endDate: formattedData.endDate,
      revenuePercentage: formattedData.revenuePercentage,
      description: formattedData.description,
      providerId: formattedData.providerId, // Koristite validirane/formatirane vrednosti
      humanitarianOrgId: formattedData.humanitarianOrgId, // Koristite validirane/formatirane vrednosti
      parkingServiceId: formattedData.parkingServiceId, // Koristite validirane/formatirane vrednosti
      services: {
        create: formattedData.services?.map(service => ({
          serviceId: service.serviceId,
          specificTerms: service.specificTerms
        })) || []
      },
      createdById: session.user.id, // Polje za korisnika koji je kreirao ugovor
    };

    const newContract = await db.contract.create({
      data: contractData,
      include: {
        services: true,
        provider: true,
        humanitarianOrg: true,
        parkingService: true,
        createdBy: true, // Dodajte da se dohvati info o korisniku ako je potrebno na frontend
      }
    });

    // --- LOG ACTIVITY ---
    await db.activityLog.create({
      data: {
        action: "CONTRACT_CREATED", // Opis radnje
        entityType: "contract",    // Tip entiteta na kojem je radnja izvrsena
        entityId: newContract.id,  // ID konkretnog entiteta (novokreiranog ugovora)
        details: `Contract created: ${newContract.contractNumber} - ${newContract.name}`, // Kratak opis
        userId: session.user.id,   // ID korisnika koji je izvrsio radnju
        severity: "INFO",          // Nivo severnosti (INFO za kreiranje)
      },
    });
    // --- KRAJ LOGOVANJA ---


    // Revalidate paths
    revalidatePath('/contracts');
    revalidatePath(`/contracts/${newContract.id}`);

    return {
      success: true, // Koristite boolean success
      message: "Contract created successfully",
      id: newContract.id, // Vratite ID novog ugovora
      contract: newContract // Opciono, vratite ceo objekat ugovora ako treba na frontendu
    };

  } catch (error) {
    console.error("[CONTRACT_CREATE_ERROR]", error); // Standardizovan log format

    if (error instanceof z.ZodError) {
       const formattedErrors = error.format();
       return {
         error: "Invalid input data", // Opstija poruka za validaciju
         formErrors: formattedErrors, // Detalji validacionih gresaka
         success: false
       };
    }

    // Handle Prisma errors
    if (error instanceof Error) {
       const prismaError = error as any; // Cast to any to access Prisma specific properties

       // Handle specific Prisma error codes
       if (prismaError.code === 'P2002') {
         return {
            error: "Data conflict", // Opstija poruka
            message: "A record with this unique field already exists.",
            details: prismaError.meta?.target, // Npr. target field
            success: false
         };
       }

       if (prismaError.code === 'P2003') {
         // Foreign key constraint violation
         return {
           error: "Invalid reference",
           message: "One of the linked items (Provider, Org, Service) does not exist.",
           details: prismaError.meta?.field_name, // Npr. field name
           success: false
         };
       }

       // Generic Prisma Client Error
       if (prismaError.code && prismaError.clientVersion) {
            return {
                error: "Database operation failed",
                message: `Prisma error: ${prismaError.code}`,
                details: prismaError.message, // Include original Prisma message
                success: false
            };
       }
    }

    // Generic catch-all error
    return {
      error: "An unexpected error occurred",
      message: "Failed to create contract.",
      details: error instanceof Error ? error.message : "Unknown error",
      success: false
    };
  }
}