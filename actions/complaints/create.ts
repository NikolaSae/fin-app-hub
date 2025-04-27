// /actions/complaints/create.ts
"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const createComplaintSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  serviceId: z.string().optional().nullable(),
  productId: z.string().optional().nullable(),
  providerId: z.string().optional().nullable(),
  priority: z.number().min(1).max(5).default(3),
  financialImpact: z.number().optional().nullable(),
});

export type CreateComplaintFormData = z.infer<typeof createComplaintSchema>;

export async function createComplaint(data: CreateComplaintFormData) {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        error: "Unauthorized. Please sign in to create a complaint.",
      };
    }

    const validatedData = createComplaintSchema.parse(data);

    // Create the complaint
    const complaint = await db.complaint.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        serviceId: validatedData.serviceId || null,
        productId: validatedData.productId || null,
        providerId: validatedData.providerId || null,
        priority: validatedData.priority,
        financialImpact: validatedData.financialImpact || null,
        submittedById: session.user.id,
      },
    });

    // Create initial status history entry
    await db.complaintStatusHistory.create({
      data: {
        complaintId: complaint.id,
        newStatus: "NEW",
        changedById: session.user.id,
      },
    });

    // Log the activity
    await db.activityLog.create({
      data: {
        action: "COMPLAINT_CREATED",
        entityType: "complaint",
        entityId: complaint.id,
        details: `Complaint created: ${complaint.title}`,
        userId: session.user.id,
      },
    });

    // Create notifications for managers
    const managers = await db.user.findMany({
      where: {
        role: {
          in: ["ADMIN", "MANAGER"],
        },
      },
    });

    const notificationPromises = managers.map(manager => 
      db.notification.create({
        data: {
          title: "New Complaint Submitted",
          message: `A new complaint "${complaint.title}" has been submitted.`,
          type: "COMPLAINT_UPDATED",
          userId: manager.id,
          entityType: "complaint",
          entityId: complaint.id,
        },
      })
    );

    await Promise.all(notificationPromises);

    revalidatePath("/complaints");
    redirect(`/complaints/${complaint.id}`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.format();
      
      return {
        error: "Validation failed",
        formErrors: formattedErrors,
      };
    }
    
    console.error("[COMPLAINT_CREATE_ERROR]", error);
    
    return {
      error: "Failed to create complaint. Please try again.",
    };
  }
}