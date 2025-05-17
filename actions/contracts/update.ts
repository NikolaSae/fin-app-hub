// /actions/contracts/update.ts
'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { contractSchema } from '@/schemas/contract';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { ContractFormData } from '@/lib/types/contract-types';

export const updateContract = async (id: string, data: ContractFormData) => {
  try {
    console.log("[UPDATE_CONTRACT] Raw data:", JSON.stringify({
      operatorId: data.operatorId,
      isRevenueSharing: data.isRevenueSharing,
      operatorRevenue: data.operatorRevenue
    }));
    
    const formattedData = {
      ...data,
      startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
      endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
      providerId: data.type === 'PROVIDER' ? data.providerId : null,
      humanitarianOrgId: data.type === 'HUMANITARIAN' ? data.humanitarianOrgId : null,
      parkingServiceId: data.type === 'PARKING' ? data.parkingServiceId : null,
      operatorId: data.operatorId?.trim() || null,
      isRevenueSharing: data.isRevenueSharing === false ? false : true,
      operatorRevenue: data.operatorRevenue !== undefined && data.operatorRevenue !== '' 
        ? Number(data.operatorRevenue) 
        : null,
    };

    const validatedFields = contractSchema.safeParse(formattedData);
    if (!validatedFields.success) {
      return { error: "Invalid fields!", details: validatedFields.error.format() };
    }

    const {
      name,
      contractNumber,
      type,
      status,
      startDate,
      endDate,
      revenuePercentage,
      description,
      providerId,
      humanitarianOrgId,
      parkingServiceId,
      operatorId,
      isRevenueSharing,
      operatorRevenue,
      services,
    } = validatedFields.data;

    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const existingContract = await db.contract.findUnique({
      where: { id },
      include: {
        services: true,
      }
    });

    if (!existingContract) {
      return { error: "Contract not found." };
    }

    const serviceIds = Array.isArray(services) 
      ? services.map(service => typeof service === 'object' && service.serviceId ? service.serviceId : service)
      : [];

    const existingServiceIds = existingContract.services.map(sc => sc.serviceId);
    
    const servicesToAdd = serviceIds.filter(serviceId => !existingServiceIds.includes(serviceId));
    const servicesToRemove = existingServiceIds.filter(serviceId => !serviceIds.includes(serviceId));

    await db.$transaction([
      ...servicesToRemove.map(serviceId =>
        db.serviceContract.deleteMany({
          where: {
            contractId: id,
            serviceId: serviceId,
          },
        })
      ),
      ...servicesToAdd.map(serviceId =>
        db.serviceContract.create({
          data: {
            contractId: id,
            serviceId: serviceId,
            specificTerms: Array.isArray(services) 
              ? services.find(s => 
                  (typeof s === 'object' && s.serviceId === serviceId && s.specificTerms) || undefined
                )?.specificTerms 
              : undefined
          },
        })
      ),
      db.contract.update({
        where: { id },
        data: {
          name,
          status,
          startDate,
          endDate,
          revenuePercentage,
          description,
          providerId,
          humanitarianOrgId,
          parkingServiceId,
          operatorId,
          isRevenueSharing,
          operatorRevenue,
          lastModifiedById: userId,
        },
      })
    ]);
    
    // Log the final data being saved to the database
    console.log("[UPDATE_CONTRACT] Final data being saved:", {
      operatorId,
      isRevenueSharing,
      operatorRevenue
    });

    await db.activityLog.create({
      data: {
        action: "CONTRACT_UPDATED",
        entityType: "contract",
        entityId: id,
        details: `Contract updated: ${contractNumber} - ${name}`,
        userId: userId,
        severity: "INFO",
      },
    });

    revalidatePath('/app/(protected)/contracts');
    revalidatePath(`/app/(protected)/contracts/${id}`);
    revalidatePath(`/app/(protected)/contracts/${id}/edit`);
    revalidatePath('/app/(protected)/contracts/expiring');
    
    return { success: "Contract updated successfully!", id: id };
  } catch (error) {
    console.error("[UPDATE_CONTRACT_ERROR]", error);

    if (error instanceof z.ZodError) {
      return {
        error: "Invalid input data",
        formErrors: error.format()
      };
    }

    if (error instanceof Error) {
      const prismaError = error as any;

      if (prismaError.code === 'P2002') {
        return {
          error: "Data conflict",
          message: "A record with this unique field already exists.",
          details: prismaError.meta?.target
        };
      }

      if (prismaError.code === 'P2003') {
        return {
          error: "Invalid reference",
          message: "One of the linked items (Provider, Org, Operator, Service) does not exist.",
          details: prismaError.meta?.field_name
        };
      }

      if (prismaError.code && prismaError.clientVersion) {
        return {
          error: "Database operation failed",
          message: `Prisma error: ${prismaError.code}`,
          details: prismaError.message
        };
      }
    }

    return { 
      error: "Failed to update contract.",
      details: error instanceof Error ? error.message : "Unknown error" 
    };
  }
};