// /actions/contracts/contract-actions.ts

import { db } from '@/lib/db';
import { ContractStatus, ContractRenewalSubStatus } from '@prisma/client';
// Uklonjen import revalidatePath - ne radi u pages/ direktorijumu

export async function updateContractStatus(
  contractId: string,
  newStatus: ContractStatus,
  comments?: string
) {
  try {
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

    if (!existingContract) {
      return {
        success: false,
        message: 'Contract not found'
      };
    }

    // Validacija business logike
    const validationResult = validateStatusChange(existingContract.status, newStatus);
    if (!validationResult.isValid) {
      return {
        success: false,
        message: validationResult.message
      };
    }

    // Update contract status
    const updatedContract = await db.contract.update({
      where: { id: contractId },
      data: {
        status: newStatus,
        updatedAt: new Date()
      }
    });

    // If starting renewal, create a new renewal record
    if (newStatus === ContractStatus.RENEWAL_IN_PROGRESS) {
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
    }

    // Umesto revalidatePath, returnuj podatke koje treba da komponenta refresh-uje
    return {
      success: true,
      message: `Contract status updated to ${newStatus.replace(/_/g, ' ').toLowerCase()}`,
      contract: updatedContract,
      shouldRefresh: true // Flag za frontend da zna da treba refresh
    };

  } catch (error) {
    console.error('Error updating contract status:', error);
    return {
      success: false,
      message: 'Failed to update contract status'
    };
  }
}

export async function updateRenewalSubStatus(
  contractId: string,
  newSubStatus: ContractRenewalSubStatus,
  comments?: string
) {
  try {
    // Find the most recent renewal for this contract
    const latestRenewal = await db.contractRenewal.findFirst({
      where: { contractId },
      orderBy: { createdAt: 'desc' }
    });

    if (!latestRenewal) {
      return {
        success: false,
        message: 'No active renewal found for this contract'
      };
    }

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

    return {
      success: true,
      message: `Renewal status updated to ${newSubStatus.replace(/_/g, ' ').toLowerCase()}`,
      renewal: updatedRenewal,
      shouldRefresh: true
    };

  } catch (error) {
    console.error('Error updating renewal sub-status:', error);
    return {
      success: false,
      message: 'Failed to update renewal status'
    };
  }
}

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

// Helper function to validate status changes
function validateStatusChange(currentStatus: ContractStatus, newStatus: ContractStatus) {
  const validTransitions: Record<ContractStatus, ContractStatus[]> = {
    [ContractStatus.DRAFT]: [ContractStatus.ACTIVE, ContractStatus.TERMINATED],
    [ContractStatus.ACTIVE]: [ContractStatus.RENEWAL_IN_PROGRESS, ContractStatus.EXPIRED, ContractStatus.TERMINATED],
    [ContractStatus.PENDING]: [ContractStatus.ACTIVE, ContractStatus.RENEWAL_IN_PROGRESS, ContractStatus.TERMINATED],
    [ContractStatus.RENEWAL_IN_PROGRESS]: [ContractStatus.ACTIVE, ContractStatus.EXPIRED, ContractStatus.TERMINATED],
    [ContractStatus.EXPIRED]: [ContractStatus.RENEWAL_IN_PROGRESS, ContractStatus.TERMINATED],
    [ContractStatus.TERMINATED]: [] // No transitions from terminated
  };

  const allowedTransitions = validTransitions[currentStatus] || [];
  
  if (!allowedTransitions.includes(newStatus)) {
    return {
      isValid: false,
      message: `Cannot change status from ${currentStatus} to ${newStatus}`
    };
  }

  return { isValid: true, message: '' };
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