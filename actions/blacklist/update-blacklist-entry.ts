// actions/blacklist/update-blacklist-entry.ts
"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface UpdateBlacklistEntryData {
  id: string;
  isActive?: boolean;
  description?: string;
  effectiveDate?: Date;
}

export async function updateBlacklistEntry(data: UpdateBlacklistEntryData) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const updatedEntry = await db.senderBlacklist.update({
      where: { id: data.id },
      data: {
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.effectiveDate && { effectiveDate: data.effectiveDate }),
        updatedAt: new Date()
      },
      include: {
        // REMOVED INVALID PROVIDER RELATION
        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Add null provider to satisfy type requirements
    const updatedEntryWithProvider = {
      ...updatedEntry,
      provider: null
    };

    revalidatePath('/providers');
    return { success: true, data: updatedEntryWithProvider };
  } catch (error) {
    console.error("Error updating blacklist entry:", error);
    return { success: false, error: "Failed to update blacklist entry" };
  }
}