// /actions/contracts/update.ts
'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { contractSchema } from '@/schemas/contract';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { ContractFormData } from '@/lib/types/contract-types';

export const updateContract = async (id: string, values: ContractFormData) => {
  const validatedFields = contractSchema.safeParse(values);

  if (!validatedFields.success) {
    console.error("Validation failed:", validatedFields.error.errors);
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

  try {
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

    const existingServiceIds = existingContract.services.map(sc => sc.serviceId);
    const servicesToAdd = services?.filter(serviceId => !existingServiceIds.includes(serviceId)) || [];
    const servicesToRemove = existingServiceIds.filter(serviceId => !services?.includes(serviceId)) || [];

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

    revalidatePath('/app/(protected)/contracts');
    revalidatePath(`/app/(protected)/contracts/${id}`);
    revalidatePath(`/app/(protected)/contracts/${id}/edit`);
    revalidatePath('/app/(protected)/contracts/expiring');

    return { success: "Contract updated successfully!", id: id };

  } catch (error) {
    console.error("Error updating contract:", error);
    return { error: "Failed to update contract." };
  }
};