'use server' // Add this directive at the top

import { db } from '@/lib/db';
import { ContractStatus, ContractRenewalSubStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function updateContractStatus(
  contractId: string,
  newStatus: ContractStatus,
  comments?: string
) {
  try {
    console.log('🔍 Starting updateContractStatus:', { contractId, newStatus, comments });

    // Validacija input parametara
    if (!contractId || !contractId.trim()) {
      console.error('❌ Invalid contractId:', contractId);
      return {
        success: false,
        message: 'Contract ID is required'
      };
    }

    if (!Object.values(ContractStatus).includes(newStatus)) {
      console.error('❌ Invalid contract status:', newStatus);
      return {
        success: false,
        message: 'Invalid contract status'
      };
    }

    // Validacija da ugovor postoji
    const existingContract = await db.contract.findUnique({
      where: { id: contractId },
      include: {
        renewals: {
          orderBy: {
            createdAt: "desc"
          },
          take: 1
        }
      }
    });

    console.log('📄 Found contract:', existingContract ? 'Yes' : 'No');
    if (!existingContract) {
      console.error('❌ Contract not found with ID:', contractId);
      return {
        success: false,
        message: 'Contract not found'
      };
    }

    console.log('🏷️ Current status:', existingContract.status, '-> New status:', newStatus);

    // Validacija business logike
    const validationResult = validateStatusChange(existingContract.status, newStatus);
    console.log('✅ Validation result:', validationResult);
    
    if (!validationResult.isValid) {
      console.error('❌ Status change validation failed:', validationResult.message);
      return {
        success: false,
        message: validationResult.message
      };
    }

    // Update contract status
    console.log('💾 Updating contract status...');
    const updatedContract = await db.contract.update({
      where: { id: contractId },
      data: {
        status: newStatus,
        updatedAt: new Date()
      }
    });

    console.log('✅ Contract updated successfully');

    // If starting renewal, create a new renewal record
    if (newStatus === ContractStatus.RENEWAL_IN_PROGRESS) {
      console.log('🔄 Creating renewal record...');
      
      try {
        await db.contractRenewal.create({
          data: {
            contractId: contractId,
            subStatus: ContractRenewalSubStatus.DOCUMENT_COLLECTION,
            proposedStartDate: existingContract.endDate,
            proposedEndDate: new Date(existingContract.endDate.getTime() + (365 * 24 * 60 * 60 * 1000)), // +1 year
            proposedRevenue: existingContract.revenuePercentage,
            documentsReceived: false,
            legalApproved: false,
            financialApproved: false,
            technicalApproved: false,
            managementApproved: false,
            signatureReceived: false,
            comments: comments || 'Renewal process started',
            createdById: 'system', // Replace with actual user ID from session
          }
        });
        console.log('✅ Renewal record created successfully');
      } catch (renewalError) {
        console.error('❌ Error creating renewal record:', renewalError);
        // Ne prekidamo proces ako renewal kreiranje ne uspe
        // ali logujemo grešku
      }
    }

    // Revalidate the page to refresh data
    revalidatePath('/contracts');
    revalidatePath(`/contracts/${contractId}`);

    return {
      success: true,
      message: `Contract status updated to ${newStatus.replace(/_/g, ' ').toLowerCase()}`,
      contract: updatedContract,
      shouldRefresh: true
    };

  } catch (error) {
    console.error('❌ Error in updateContractStatus:', error);
    
    // Detaljnije logovanje greške
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    // Specifične greške za Prisma
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any;
      console.error('Prisma error code:', prismaError.code);
      console.error('Prisma error meta:', prismaError.meta);
      
      if (prismaError.code === 'P2025') {
        return {
          success: false,
          message: 'Contract not found or already deleted'
        };
      }
      
      if (prismaError.code === 'P2002') {
        return {
          success: false,
          message: 'Database constraint violation'
        };
      }
    }

    return {
      success: false,
      message: 'Failed to update contract status: ' + (error instanceof Error ? error.message : 'Unknown error')
    };
  }
}

// Rest of your functions with 'use server' at the top
export async function updateRenewalSubStatus(
  contractId: string,
  newSubStatus: ContractRenewalSubStatus,
  comments?: string
) {
  try {
    console.log('🔍 Starting updateRenewalSubStatus:', { contractId, newSubStatus });
    
    // Find the most recent renewal for this contract
    const latestRenewal = await db.contractRenewal.findFirst({
      where: { contractId },
      orderBy: { createdAt: 'desc' }
    });

    if (!latestRenewal) {
      console.error('❌ No renewal found for contract:', contractId);
      return {
        success: false,
        message: 'No active renewal found for this contract'
      };
    }

    console.log('🔄 Found renewal:', latestRenewal.id, 'Current sub-status:', latestRenewal.subStatus);

    // Update the renewal sub-status
    const updatedRenewal = await db.contractRenewal.update({
      where: { id: latestRenewal.id },
      data: {
        subStatus: newSubStatus,
        comments: comments || latestRenewal.comments,
        updatedAt: new Date(),
        lastModifiedById: 'system', // Replace with actual user ID from session
        
        // Update approval flags based on sub-status
        ...(newSubStatus === ContractRenewalSubStatus.DOCUMENT_COLLECTION && {
          documentsReceived: true
        }),
        ...(newSubStatus === ContractRenewalSubStatus.LEGAL_REVIEW && {
          legalApproved: true
        }),
        ...(newSubStatus === ContractRenewalSubStatus.TECHNICAL_REVIEW && {
          technicalApproved: true
        }),
        ...(newSubStatus === ContractRenewalSubStatus.FINANCIAL_APPROVAL && {
          financialApproved: true
        }),
        ...(newSubStatus === ContractRenewalSubStatus.MANAGEMENT_APPROVAL && {
          managementApproved: true
        }),
        ...(newSubStatus === ContractRenewalSubStatus.AWAITING_SIGNATURE && {
          signatureReceived: false // Reset to false when awaiting
        }),
        ...(newSubStatus === ContractRenewalSubStatus.FINAL_PROCESSING && {
          signatureReceived: true
        })
      }
    });

    console.log('✅ Renewal sub-status updated successfully');

    // Revalidate the page
    revalidatePath('/contracts');
    revalidatePath(`/contracts/${contractId}`);

    return {
      success: true,
      message: `Renewal status updated to ${newSubStatus.replace(/_/g, ' ').toLowerCase()}`,
      renewal: updatedRenewal,
      shouldRefresh: true
    };

  } catch (error) {
    console.error('❌ Error updating renewal sub-status:', error);
    return {
      success: false,
      message: 'Failed to update renewal status: ' + (error instanceof Error ? error.message : 'Unknown error')
    };
  }
}

// Poboljšana validacija sa detaljnijim logom
function validateStatusChange(currentStatus: ContractStatus, newStatus: ContractStatus) {
  console.log('🔍 Validating status change:', { currentStatus, newStatus });
  
  const validTransitions: Record<ContractStatus, ContractStatus[]> = {
    [ContractStatus.DRAFT]: [ContractStatus.ACTIVE, ContractStatus.TERMINATED],
    [ContractStatus.ACTIVE]: [ContractStatus.RENEWAL_IN_PROGRESS, ContractStatus.EXPIRED, ContractStatus.TERMINATED],
    [ContractStatus.PENDING]: [ContractStatus.ACTIVE, ContractStatus.RENEWAL_IN_PROGRESS, ContractStatus.TERMINATED],
    [ContractStatus.RENEWAL_IN_PROGRESS]: [ContractStatus.ACTIVE, ContractStatus.EXPIRED, ContractStatus.TERMINATED],
    [ContractStatus.EXPIRED]: [ContractStatus.RENEWAL_IN_PROGRESS, ContractStatus.TERMINATED],
    [ContractStatus.TERMINATED]: [] // No transitions from terminated
  };

  const allowedTransitions = validTransitions[currentStatus] || [];
  console.log('📋 Allowed transitions from', currentStatus, ':', allowedTransitions);
  
  if (!allowedTransitions.includes(newStatus)) {
    const errorMessage = `Cannot change status from ${currentStatus.replace(/_/g, ' ')} to ${newStatus.replace(/_/g, ' ')}`;
    console.error('❌ Invalid transition:', errorMessage);
    return {
      isValid: false,
      message: errorMessage
    };
  }

  console.log('✅ Status change validation passed');
  return { isValid: true, message: '' };
}

// Rest of your functions remain the same...
export async function completeContractRenewal(
  contractId: string,
  newContractData?: Partial<{
    startDate: Date;
    endDate: Date;
    revenuePercentage: number;
  }>,
  comments?: string
) {
  try {
    // Find the contract and its latest renewal
    const contract = await db.contract.findUnique({
      where: { id: contractId },
      include: {
        renewals: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!contract) {
      return {
        success: false,
        message: 'Contract not found'
      };
    }

    const latestRenewal = contract.renewals[0];
    if (!latestRenewal) {
      return {
        success: false,
        message: 'No renewal found for this contract'
      };
    }

    if (latestRenewal.subStatus !== ContractRenewalSubStatus.FINAL_PROCESSING) {
      return {
        success: false,
        message: 'Renewal must be in final processing stage to complete'
      };
    }

    // Start transaction
    const result = await db.$transaction(async (tx) => {
      // Update the contract with new terms
      const updatedContract = await tx.contract.update({
        where: { id: contractId },
        data: {
          status: ContractStatus.ACTIVE,
          startDate: newContractData?.startDate || new Date(latestRenewal.proposedStartDate),
          endDate: newContractData?.endDate || new Date(latestRenewal.proposedEndDate),
          revenuePercentage: newContractData?.revenuePercentage || latestRenewal.proposedRevenue || contract.revenuePercentage,
          updatedAt: new Date()
        }
      });

      // Mark the renewal as completed by updating its comments
      await tx.contractRenewal.update({
        where: { id: latestRenewal.id },
        data: {
          comments: comments || 'Renewal completed successfully',
          internalNotes: `Renewal completed on ${new Date().toISOString()}`,
          updatedAt: new Date(),
          lastModifiedById: 'system' // Replace with actual user ID
        }
      });

      return updatedContract;
    });

    // Revalidate the page
    revalidatePath('/contracts');
    revalidatePath(`/contracts/${contractId}`);

    return {
      success: true,
      message: 'Contract renewal completed successfully',
      contract: result,
      shouldRefresh: true
    };

  } catch (error) {
    console.error('Error completing contract renewal:', error);
    return {
      success: false,
      message: 'Failed to complete contract renewal'
    };
  }
}

// Helper function to get contract with latest renewal
export async function getContractWithLatestRenewal(contractId: string) {
  try {
    const contract = await db.contract.findUnique({
      where: { id: contractId },
      include: {
        renewals: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            attachments: {
              include: {
                uploadedBy: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        provider: { select: { name: true } },
        humanitarianOrg: { select: { name: true } },
        parkingService: { select: { name: true } },
        services: true
      }
    });

    return contract;
  } catch (error) {
    console.error('Error fetching contract with renewal:', error);
    return null;
  }
}