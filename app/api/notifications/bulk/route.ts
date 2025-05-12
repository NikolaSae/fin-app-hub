///api/notifications/bulk/route.ts


import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NotificationType } from "@prisma/client";

// Schema for creating bulk notifications
const BulkNotificationSchema = z.object({
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  type: z.nativeEnum(NotificationType),
  roles: z.array(z.string()).min(1),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
});

// POST handler to create notifications for multiple users based on roles
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Only admins can create bulk notifications
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const validatedData = BulkNotificationSchema.parse(body);
    
    // Get users with the specified roles
    const users = await db.user.findMany({
      where: {
        role: {
          in: validatedData.roles,
        },
      },
      select: {
        id: true,
      },
    });
    
    if (users.length === 0) {
      return NextResponse.json({ 
        message: "No users found with the specified roles", 
        success: false 
      }, { status: 200 });
    }
    
    // Create notifications for each user
    const notificationData = users.map(user => ({
      title: validatedData.title,
      message: validatedData.message,
      type: validatedData.type,
      userId: user.id,
      entityType: validatedData.entityType,
      entityId: validatedData.entityId,
    }));
    
    // Use createMany for better performance with multiple notifications
    const result = await db.notification.createMany({
      data: notificationData,
    });
    
    // Log the activity
    await db.activityLog.create({
      data: {
        action: "CREATE_BULK_NOTIFICATIONS",
        entityType: "NOTIFICATION",
        details: `Created ${result.count} notifications titled "${validatedData.title}" for roles: ${validatedData.roles.join(', ')}`,
        userId: session.user.id,
      },
    });
    
    return NextResponse.json({
      success: true,
      message: `Created ${result.count} notifications`,
      count: result.count,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating bulk notifications:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid notification data", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create notifications" }, { status: 500 });
  }
}