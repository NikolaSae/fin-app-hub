//actions/contracts/update.ts
'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';
import { ContractType } from '@prisma/client';

export async function updateContract(contractId: string, data: any) {
  try {
    // Get current user
    const session = await auth();
    const userId = session?.user?.id;
    const userRole = session?.user?.role;
    
    if (!userId) {
      return { error: "Authentication required" };
    }

    // Get the contract to check ownership
    const existingContract = await db.contract.findUnique({
      where: { id: contractId },
      select: { 
        id: true, 
        createdById: true,
        contractNumber: true,
        type: true
      }
    });
    
    if (!existingContract) {
      return { error: "Contract not found" };
    }
    
    // Check permissions - ADMIN or contract owner can update
    const isAdmin = userRole === 'ADMIN';
    const isOwner = existingContract.createdById === userId;
    
    if (!isAdmin && !isOwner) {
      return { error: "You don't have permission to update this contract" };
    }

    // Prepare data for database
    const dbData = {
      ...data,
      // Clear irrelevant IDs based on contract type
      providerId: data.type === ContractType.PROVIDER ? data.providerId : null,
      humanitarianOrgId: data.type === ContractType.HUMANITARIAN ? data.humanitarianOrgId : null,
      parkingServiceId: data.type === ContractType.PARKING ? data.parkingServiceId : null,
      // Clear operator data if revenue sharing is disabled
      operatorId: data.isRevenueSharing ? data.operatorId : null,
      operatorRevenue: data.isRevenueSharing ? data.operatorRevenue : 0,
      updatedAt: new Date(),
    };

    // Perform the update with transaction
    const updatedContract = await db.$transaction(async (tx) => {
      // Handle services update
      if (Array.isArray(data.services)) {
        // Delete existing services
        await tx.serviceContract.deleteMany({
          where: { contractId }
        });
        
        // Create new services if any
        if (data.services.length > 0) {
          await tx.serviceContract.createMany({
            data: data.services.map((service: any) => ({
              contractId,
              serviceId: service.serviceId,
              specificTerms: service.specificTerms || null
            }))
          });
        }
      }
      
      // Update the main contract
      return await tx.contract.update({
        where: { id: contractId },
        data: dbData,
        include: {
          services: {
            include: {
              service: true
            }
          },
          provider: true,
          operator: true,
          humanitarianOrg: true,
          parkingService: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
    });

    // Create activity log
    await db.activityLog.create({
      data: {
        action: "CONTRACT_UPDATED",
        entityType: "contract",
        entityId: contractId,
        details: `Contract updated: ${updatedContract.contractNumber} - ${updatedContract.name}`,
        userId: userId,
        severity: "INFO",
      },
    });

    // Revalidate cache
    revalidatePath('/contracts');
    revalidatePath(`/contracts/${contractId}`);

    return { 
      success: true, 
      contract: updatedContract,
      message: "Contract updated successfully"
    };
    
  } catch (error: any) {
    console.error("[UPDATE_CONTRACT] Error:", error);
    
    // Handle specific errors
    if (error.code === 'P2002') {
      return { 
        error: "Contract number already exists",
        success: false
      };
    }
    
    if (error.code === 'P2003') {
      return { 
        error: "Invalid reference to provider, operator, or service",
        success: false
      };
    }
    
    if (error.code === 'P2025') {
      return { 
        error: "Contract not found",
        success: false
      };
    }
    
    return { 
      error: error.message || "Failed to update contract",
      success: false
    };
  }
}