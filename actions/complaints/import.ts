// /actions/complaints/import.ts
"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ComplaintImportSchema } from "@/schemas/complaint";
import { ActivityLog, LogSeverity, Complaint, ComplaintStatus } from "@prisma/client";

export type ImportResult = {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
};

export async function importComplaints(csvData: string): Promise<ImportResult> {
  const session = await auth();
  if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role)) {
    throw new Error("Unauthorized access");
  }

  const result: ImportResult = {
    success: false,
    imported: 0,
    failed: 0,
    errors: [],
  };

  try {
    // Parse CSV data (simple implementation - consider using a proper CSV parser library)
    const rows = csvData.trim().split("\n");
    const headers = rows[0].split(",").map((h) => h.trim());
    const dataRows = rows.slice(1);

    for (const row of dataRows) {
      try {
        const values = row.split(",").map((v) => v.trim());
        const rowData: Record<string, any> = {};
        
        headers.forEach((header, index) => {
          rowData[header] = values[index];
        });

        // Validate and parse data
        const complaintData = ComplaintImportSchema.parse({
          title: rowData.title,
          description: rowData.description,
          priority: parseInt(rowData.priority) || 3,
          serviceId: rowData.serviceId || null,
          productId: rowData.productId || null,
          providerId: rowData.providerId || null,
          financialImpact: rowData.financialImpact ? parseFloat(rowData.financialImpact) : null,
        });

        // Create the complaint
        const complaint = await db.complaint.create({
          data: {
            ...complaintData,
            status: ComplaintStatus.NEW,
            submittedById: session.user.id,
            // Create initial status history
            statusHistory: {
              create: {
                newStatus: ComplaintStatus.NEW,
                changedById: session.user.id,
              },
            },
          },
        });

        // Log activity
        await db.activityLog.create({
          data: {
            action: "IMPORT_COMPLAINT",
            entityType: "complaint",
            entityId: complaint.id,
            details: `Imported complaint: ${complaint.title}`,
            severity: LogSeverity.INFO,
            userId: session.user.id,
          },
        });

        result.imported++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Row ${result.imported + result.failed}: ${error.message || "Unknown error"}`);
      }
    }

    result.success = result.imported > 0;
    revalidatePath("/complaints");
    return result;
  } catch (error) {
    result.success = false;
    result.errors.push(`Import process failed: ${error.message || "Unknown error"}`);
    return result;
  }
}