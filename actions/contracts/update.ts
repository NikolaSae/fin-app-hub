// /actions/contracts/update.ts
'use server'

import { z } from 'zod';
import { contractSchema } from '@/schemas/contract';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { logActivity } from '@/lib/security/audit-logger';

export async function updateContract(id: string, formData: any) {
  console.log('[UPDATE_CONTRACT] Starting update for:', id);
  console.log('[UPDATE_CONTRACT] Data keys:', Object.keys(formData));
  
  try {
    // Pokušaj da dobiješ session - ovo je kritična linija
    let session;
    try {
      session = await auth();
    } catch (authError) {
      console.error('[UPDATE_CONTRACT] Auth error:', authError);
      return { 
        success: false, 
        error: 'Authentication failed. Please refresh the page and try again.' 
      };
    }
    
    if (!session?.user) {
      console.log('[UPDATE_CONTRACT] No session or user');
      return { success: false, error: 'Unauthorized - please log in again' };
    }

    console.log('[UPDATE_CONTRACT] Session obtained:', {
      userId: session.user.id,
      userRole: session.user.role
    });

    // Validacija podataka
    let validatedData;
    try {
      validatedData = contractSchema.parse(formData);
    } catch (validationError) {
      console.error('[UPDATE_CONTRACT] Validation error:', validationError);
      return { 
        success: false, 
        error: 'Invalid form data. Please check all fields.' 
      };
    }
    
    // Pronađi postojeći ugovor
    const existingContract = await db.contract.findUnique({
      where: { id },
      select: {
        id: true,
        createdById: true,
        name: true
      }
    });
    
    if (!existingContract) {
      console.log('[UPDATE_CONTRACT] Contract not found:', id);
      return { success: false, error: 'Contract not found' };
    }

    console.log('[UPDATE_CONTRACT] Existing contract:', {
      id: existingContract.id,
      createdById: existingContract.createdById
    });

    // Proveri dozvole
    const isAdmin = session.user.role === 'ADMIN';
    const isOwner = existingContract.createdById === session.user.id;
    
    console.log('[UPDATE_CONTRACT] Permission check:', {
      isAdmin,
      isOwner,
      userRole: session.user.role,
      userId: session.user.id,
      contractCreatedById: existingContract.createdById
    });
    
    if (!isAdmin && !isOwner) {
      return { 
        success: false, 
        error: 'You do not have permission to edit this contract' 
      };
    }

    // Ažuriraj ugovor
    const updatedContract = await db.contract.update({
      where: { id },
      data: {
        name: validatedData.name,
        contractNumber: validatedData.contractNumber,
        type: validatedData.type,
        status: validatedData.status,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        revenuePercentage: validatedData.revenuePercentage,
        description: validatedData.description,
        providerId: validatedData.providerId,
        humanitarianOrgId: validatedData.humanitarianOrgId,
        parkingServiceId: validatedData.parkingServiceId,
        operatorId: validatedData.operatorId,
        isRevenueSharing: validatedData.isRevenueSharing,
        operatorRevenue: validatedData.operatorRevenue,
        services: validatedData.services,
        updatedAt: new Date()
      }
    });

    console.log('[UPDATE_CONTRACT] Contract updated successfully:', updatedContract.id);

    // Log aktivnost (opciono - samo ako logActivity radi)
    try {
      await logActivity({
        action: 'UPDATE',
        entityType: 'contract',
        entityId: updatedContract.id,
        details: `Updated contract: ${updatedContract.name}`,
        userId: session.user.id
      });
    } catch (logError) {
      console.warn('[UPDATE_CONTRACT] Failed to log activity:', logError);
      // Ne prekidaj proces zbog greške u logovanju
    }

    // Revalidate cache
    try {
      revalidatePath('/contracts');
      revalidatePath(`/contracts/${id}`);
      revalidatePath(`/contracts/${id}/edit`);
    } catch (revalidateError) {
      console.warn('[UPDATE_CONTRACT] Failed to revalidate paths:', revalidateError);
      // Ne prekidaj proces zbog greške u revalidaciji
    }

    console.log('[UPDATE_CONTRACT] Success - returning result');
    return { 
      success: true, 
      contractId: updatedContract.id,
      message: 'Contract updated successfully'
    };
    
  } catch (error) {
    console.error('[UPDATE_CONTRACT] Unexpected error:', error);
    
    // Specifične greške
    if (error instanceof Error) {
      if (error.message.includes('headers')) {
        return { 
          success: false, 
          error: 'Session error. Please refresh the page and try again.' 
        };
      }
      if (error.message.includes('Unique constraint')) {
        return { 
          success: false, 
          error: 'Contract number already exists. Please use a different number.' 
        };
      }
    }
    
    return { 
      success: false, 
      error: 'Failed to update contract. Please try again.' 
    };
  }
}