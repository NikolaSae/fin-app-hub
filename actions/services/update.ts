///actions/services/update.ts

'use server'

import { z } from 'zod';
import { serviceSchema } from '@/schemas/service';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { ServiceType } from '@prisma/client';
import { logActivity } from '@/lib/security/audit-logger';

export async function updateService(id: string, formData: z.infer<typeof serviceSchema>) {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  
  try {
    // Validate form data
    const validatedData = serviceSchema.parse(formData);
    
    // Find the service to get original type
    const originalService = await prisma.service.findUnique({
      where: { id }
    });
    
    if (!originalService) {
      throw new Error("Service not found");
    }
    
    // Update the service
    const service = await db.service.update({
      where: { id },
      data: {
        name: validatedData.name,
        type: validatedData.type as ServiceType,
        description: validatedData.description,
        isActive: validatedData.isActive
      }
    });
    
    // Log activity
    await logActivity({
      action: 'UPDATE',
      entityType: 'service',
      entityId: service.id,
      details: `Updated service: ${service.name}`,
      userId: session.user.id
    });
    
    // Revalidate cache
    revalidatePath('/services');
    revalidatePath(`/services/${originalService.type.toLowerCase()}`);
    revalidatePath(`/services/${service.type.toLowerCase()}`);
    revalidatePath(`/services/${service.type.toLowerCase()}/${id}`);
    
    return { success: true, serviceId: service.id, serviceType: service.type };
  } catch (error) {
    console.error('Failed to update service:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}