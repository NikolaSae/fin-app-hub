// actions/blacklist/delete-blacklist-entry.ts
"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteBlacklistEntry(id: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await db.senderBlacklist.delete({
      where: { id }
    });

    revalidatePath('/providers');
    return { success: true };
  } catch (error) {
    console.error("Error deleting blacklist entry:", error);
    return { success: false, error: "Failed to delete blacklist entry" };
  }
}