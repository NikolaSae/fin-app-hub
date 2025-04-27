// /actions/complaints/update.ts
"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ComplaintStatus } from "@prisma/client";

const updateComplaintSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  serviceId: z.string().optional().nullable(),
  productId: z.string().optional().nullable(),
  providerId: z.string().optional().nullable(),
  priority: z.number().min(1).max(5),
  financialImpact: z.number().optional().nullable(),
  status: z.nativeEnum(ComplaintStatus).optional(),
  assignedAgentId: z.string().optional().nullable(),
});

export type UpdateComplaintFormData = z.infer<typeof updateComplaintSchema>;

export async function updateComplaint(data: UpdateComplaintFormData) {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        error: "Unauthorized. Please sign in to update a complaint.",
      };
    }

    const validatedData = updateComplaintSchema.parse(data);

    // Fetch the existing complaint
    const existingComplaint = await db.complaint.findUnique({
      where: { id: validatedData.id },
    });

    if (!existingComplaint) {
      return {
        error: "Complaint not found",
      };
    }

    // Check if user has permission to update this complaint
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    const isSubmitter = existingComplaint.submittedById === session.user.id;
    const isAssigned = existingComplaint.assignedAgentId === session.user.id;
    const canUpdate = ["ADMIN", "MANAGER"].includes(user?.role || "") || isSubmitter || isAssigned;

    if (!canUpdate) {
      return {
        error: "You don't have permission to update this complaint",
      };
    }

    // Regular users can only update title and description
    let updateData: any = {};
    
    if (["ADMIN", "MANAGER", "AGENT"].includes(user?.role || "")) {
      // Staff can update all fields
      updateData = {
        title: validatedData.title,
        description: validatedData.description,
        serviceId: validatedData.serviceId,
        productId: validatedData.productId,
        providerId: validatedData.providerId,
        priority: validatedData.priority,
        financialImpact: validatedData.financialImpact,
      };
      
      // Only staff can update status and assignment
      if (validatedData.status && validatedData.status !== existingComplaint.status) {
        updateData.status = validatedData.status;
        
        // Handle special status changes
        if (validatedData.status === "RESOLVED" && !existingComplaint.resolvedAt) {
          updateData.resolvedAt = new Date();
        }
        
        if (validatedData.status === "CLOSED" && !existingComplaint.closedAt) {
          updateData.closedAt = new Date();
        }
        
        // Record status history
        await db.complaintStatusHistory.create({
          data: {
            complaintId: existingComplaint.id,
            previousStatus: existingComplaint.status,
            newStatus: validatedData.status,
            changedById: session.user.id,
          },
        });
      }
      
      // Handle agent assignment changes
      if (validatedData.assignedAgentId !== existingComplaint.assignedAgentId) {
        updateData.assignedAgentId = validatedData.assignedAgentId;
        
        if (validatedData.assignedAgentId && !existingComplaint.assignedAgentId) {
          updateData.assignedAt = new Date();
          updateData.status = "ASSIGNED";
          
          // Record status change for new assignment
          if (existingComplaint.status !== "ASSIGNED") {
            await db.complaintStatusHistory.create({
              data: {
                complaintId: existingComplaint.id,
                previousStatus: existingComplaint.status,
                newStatus: "ASSIGNED",
                changedById: session.user.id,
              },
            });
          }
          
          // Notify the newly assigned agent
          await db.notification.create({
            data: {
              title: "Complaint Assigned",
              message: `You have been assigned to handle complaint: "${existingComplaint.title}"`,
              type: "COMPLAINT_ASSIGNED",
              userId: validatedData.assignedAgentId,
              entityType: "complaint",
              entityId: existingComplaint.id,
            },
          });
        }
      }
    } else {
      // Regular users can only update title and description
      updateData = {
        title: validatedData.title,
        description: validatedData.description,
      };
    }

    // Update the complaint
    const updatedComplaint = await db.complaint.update({
      where: { id: validatedData.id },
      data: updateData,
    });

    // Log the activity
    await db.activityLog.create({
      data: {
        action: "COMPLAINT_UPDATED",
        entityType: "complaint",
        entityId: existingComplaint.id,
        details: `Complaint updated: ${existingComplaint.title}`,
        userId: session.user.id,
      },
    });

    // Notify relevant parties about the update
    if (existingComplaint.submittedById !== session.user.id) {
      await db.notification.create({
        data: {
          title: "Complaint Updated",
          message: `Your complaint "${existingComplaint.title}" has been updated.`,
          type: "COMPLAINT_UPDATED",
          userId: existingComplaint.submittedById,
          entityType: "complaint",
          entityId: existingComplaint.id,
        },
      });
    }

    if (
      existingComplaint.assignedAgentId &&
      existingComplaint.assignedAgentId !== session.user.id &&
      existingComplaint.assignedAgentId === updateData.assignedAgentId // Only notify if still assigned
    ) {
      await db.notification.create({
        data: {
          title: "Assigned Complaint Updated",
          message: `Complaint "${existingComplaint.title}" that you're assigned to has been updated.`,
          type: "COMPLAINT_UPDATED",
          userId: existingComplaint.assignedAgentId,
          entityType: "complaint",
          entityId: existingComplaint.id,
        },
      });
    }

    revalidatePath(`/complaints/${updatedComplaint.id}`);
    redirect(`/complaints/${updatedComplaint.id}`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.format();
      
      return {
        error: "Validation failed",
        formErrors: formattedErrors,
      };
    }
    
    console.error("[COMPLAINT_UPDATE_ERROR]", error);
    
    return {
      error: "Failed to update complaint. Please try again.",
    };
  }
}