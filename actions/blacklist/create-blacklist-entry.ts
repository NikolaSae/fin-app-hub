// actions/blacklist/create-blacklist-entry.ts
"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface CreateBlacklistEntryData {
  senderName: string;
  effectiveDate: Date;
  description?: string;
  isActive?: boolean;
}

export async function createBlacklistEntry(data: CreateBlacklistEntryData) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Proveri da li već postoji unos za ovog sendera (globalno)
    const existingEntry = await db.senderBlacklist.findFirst({
      where: {
        senderName: data.senderName
      }
    });

    if (existingEntry) {
      return { 
        success: false, 
        error: `Blacklist entry already exists for sender: ${data.senderName}` 
      };
    }

    // Kreiraj JEDAN globalni unos bez provajdera
    const blacklistEntry = await db.senderBlacklist.create({
      data: {
        senderName: data.senderName,
        effectiveDate: data.effectiveDate,
        description: data.description,
        isActive: data.isActive ?? true,
        createdById: session.user.id
      }
    });

    // Dohvati kreirani unos sa relacijama
    const createdEntry = await db.senderBlacklist.findUnique({
      where: { id: blacklistEntry.id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    revalidatePath('/providers');
    revalidatePath('/blacklist');
    
    return { 
      success: true, 
      data: createdEntry ? [createdEntry] : [],
      message: `Blacklist entry created for sender: ${data.senderName}`
    };
  } catch (error) {
    console.error("Error creating blacklist entry:", error);
    return { success: false, error: "Failed to create blacklist entry" };
  }
}