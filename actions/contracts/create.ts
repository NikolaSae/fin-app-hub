// Path: /actions/contracts/create.ts
'use server';

import { db } from '@/lib/db';
import { contractSchema } from '@/schemas/contract';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import type { ContractFormData } from '@/schemas/contract';
import { z } from 'zod';

export async function createContract(data: ContractFormData) {
  try {
    const formattedData = {
      ...data,
      startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
      endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
      providerId: data.type === 'PROVIDER' ? data.providerId : null,
      humanitarianOrgId: data.type === 'HUMANITARIAN' ? data.humanitarianOrgId : null,
      parkingServiceId: data.type === 'PARKING' ? data.parkingServiceId : null,
      operatorId: data.operatorId || null,
      isRevenueSharing: data.isRevenueSharing !== undefined ? data.isRevenueSharing : true,
      operatorRevenue: data.operatorRevenue || null,
    };

    const validationResult = contractSchema.safeParse(formattedData);
    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error.flatten());
      return {
        error: "Validation failed",
        details: validationResult.error.flatten(),
        success: false
      };
    }

    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized", success: false };
    }

    const existingContract = await db.contract.findUnique({
      where: { contractNumber: formattedData.contractNumber },
    });
    if (existingContract) {
      console.warn(`Attempted to create duplicate contract number: ${formattedData.contractNumber}`);
      return { error: "Contract number already exists", success: false };
    }

    const contractData = {
      name: formattedData.name,
      contractNumber: formattedData.contractNumber,
      type: formattedData.type,
      status: formattedData.status,
      startDate: formattedData.startDate,
      endDate: formattedData.endDate,
      revenuePercentage: formattedData.revenuePercentage,
      description: formattedData.description,
      providerId: formattedData.providerId,
      humanitarianOrgId: formattedData.humanitarianOrgId,
      parkingServiceId: formattedData.parkingServiceId,
      operatorId: formattedData.operatorId,
      isRevenueSharing: formattedData.isRevenueSharing,
      operatorRevenue: formattedData.operatorRevenue,
      services: {
        create: formattedData.services?.map(service => ({
          serviceId: service.serviceId,
          specificTerms: service.specificTerms
        })) || []
      },
      createdById: session.user.id,
    };

    const newContract = await db.contract.create({
      data: contractData,
      include: {
        services: true,
        provider: true,
        humanitarianOrg: true,
        parkingService: true,
        operator: true,
        createdBy: true,
      }
    });

    await db.activityLog.create({
      data: {
        action: "CONTRACT_CREATED",
        entityType: "contract",
        entityId: newContract.id,
        details: `Contract created: ${newContract.contractNumber} - ${newContract.name}`,
        userId: session.user.id,
        severity: "INFO",
      },
    });

    revalidatePath('/contracts');
    revalidatePath(`/contracts/${newContract.id}`);

    return {
      success: true,
      message: "Contract created successfully",
      id: newContract.id,
      contract: newContract
    };

  } catch (error) {
    console.error("[CONTRACT_CREATE_ERROR]", error);

    if (error instanceof z.ZodError) {
       const formattedErrors = error.format();
       return {
         error: "Invalid input data",
         formErrors: formattedErrors,
         success: false
       };
    }

    if (error instanceof Error) {
       const prismaError = error as any;

       if (prismaError.code === 'P2002') {
         return {
            error: "Data conflict",
            message: "A record with this unique field already exists.",
            details: prismaError.meta?.target,
            success: false
         };
       }

       if (prismaError.code === 'P2003') {
         return {
           error: "Invalid reference",
           message: "One of the linked items (Provider, Org, Operator, Service) does not exist.",
           details: prismaError.meta?.field_name,
           success: false
         };
       }

       if (prismaError.code && prismaError.clientVersion) {
            return {
                error: "Database operation failed",
                message: `Prisma error: ${prismaError.code}`,
                details: prismaError.message,
                success: false
            };
       }
    }

    return {
      error: "An unexpected error occurred",
      message: "Failed to create contract.",
      details: error instanceof Error ? error.message : "Unknown error",
      success: false
    };
  }
}