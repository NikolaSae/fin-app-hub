//actions/parking-services/getParkingServiceById.ts
"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logActivity } from "@/lib/security/audit-logger";

export async function getParkingServiceById(id: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const parkingService = await db.parkingService.findUnique({
      where: { id },
    });

    if (!parkingService) {
      return { success: false, error: "Parking service not found" };
    }

    await logActivity("GET_PARKING_SERVICE_BY_ID", {
      entityType: "parking_service",
      entityId: id,
      userId: currentUser.id,
      details: `Retrieved parking service with ID: ${id}`,
    });

    return { success: true, data: parkingService };
  } catch (error) {
    console.error("Error fetching parking service:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch parking service",
    };
  }
}
