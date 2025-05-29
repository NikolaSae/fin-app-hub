//actions/contracts/update.ts
import { auth } from "@/auth";
import { db } from "@/lib/db";

async function getCurrentUserWithRole() {
  const session = await auth();
  
  if (!session?.user?.email) {
    return null;
  }
  
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true, email: true, name: true }
  });
  
  return user;
}

export async function updateContract(contractId: string, data: any) {
  console.log("[UPDATE_CONTRACT] Starting update for:", contractId);
  console.log("[UPDATE_CONTRACT] Data keys:", Object.keys(data || {}));
  
  try {
    // Get current user with role from database
    const currentUser = await getCurrentUserWithRole();
    
    if (!currentUser) {
      console.error("[UPDATE_CONTRACT] No authenticated user");
      return { error: "Authentication required" };
    }
    
    console.log("[UPDATE_CONTRACT] Current user:", {
      id: currentUser.id,
      role: currentUser.role,
      email: currentUser.email
    });
    
    // Get the contract to check ownership
    const existingContract = await db.contract.findUnique({
      where: { id: contractId },
      select: { 
        id: true, 
        createdById: true,
        contractNumber: true 
      }
    });
    
    if (!existingContract) {
      console.error("[UPDATE_CONTRACT] Contract not found:", contractId);
      return { error: "Contract not found" };
    }
    
    // Check permissions - ADMIN or creator can update
    const isAdmin = currentUser.role === 'ADMIN';
    const isCreator = existingContract.createdById === currentUser.id;
    
    console.log("[UPDATE_CONTRACT] Permission check:", {
      contractId,
      currentUserId: currentUser.id,
      createdById: existingContract.createdById,
      isAdmin,
      isCreator,
      hasPermission: isAdmin || isCreator
    });
    
    if (!isAdmin && !isCreator) {
      console.error("[UPDATE_CONTRACT] Permission denied");
      return { error: "You don't have permission to update this contract" };
    }

    // Clean and prepare data for update
    const updateData = { ...data };
    
    // Remove any undefined or null values that shouldn't be updated
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === null) {
        delete updateData[key];
      }
    });
    
    // Add metadata
    updateData.updatedAt = new Date();
    // Note: You might want to add lastModifiedById if you have that field
    
    console.log("[UPDATE_CONTRACT] Prepared update data:", {
      keys: Object.keys(updateData),
      contractId
    });
    
    // Perform the update with transaction for safety
    const updatedContract = await db.$transaction(async (tx) => {
      // First, handle services if they're being updated
      if (data.services && Array.isArray(data.services)) {
        // Delete existing services
        await tx.serviceContract.deleteMany({
          where: { contractId }
        });
        
        // Create new services
        if (data.services.length > 0) {
          await tx.serviceContract.createMany({
            data: data.services.map((service: any) => ({
              contractId,
              serviceId: service.serviceId,
              specificTerms: service.specificTerms || null
            }))
          });
        }
        
        // Remove services from main update data since it's handled separately
        delete updateData.services;
      }
      
      // Update the main contract
      return await tx.contract.update({
        where: { id: contractId },
        data: updateData,
        include: {
          services: {
            include: {
              service: true
            }
          },
          provider: true,
          operator: true,
          humanitarianOrg: true,
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
    
    console.log("[UPDATE_CONTRACT] Successfully updated contract:", contractId);
    
    return { 
      success: true, 
      contract: updatedContract,
      message: "Contract updated successfully"
    };
    
  } catch (error) {
    console.error("[UPDATE_CONTRACT] Error:", error);
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return { error: "Contract number already exists" };
      }
      
      if (error.message.includes('Foreign key constraint')) {
        return { error: "Invalid reference to provider, operator, or service" };
      }
      
      if (error.message.includes('Record to update not found')) {
        return { error: "Contract not found" };
      }
    }
    
    return { error: "Failed to update contract" };
  }
}