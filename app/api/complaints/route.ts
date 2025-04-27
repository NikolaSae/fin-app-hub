// /app/api/complaints/route.ts:

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { complaintSchema, complaintFilterSchema } from "@/schemas/complaint";
import { auth } from "@/auth";

// GET - Get all complaints with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const filters: Record<string, any> = {};
    
    // Status filter
    const status = searchParams.get("status");
    if (status) filters.status = status;
    
    // Priority filter
    const priority = searchParams.get("priority");
    if (priority) filters.priority = parseInt(priority);
    
    // Service filter
    const serviceId = searchParams.get("serviceId");
    if (serviceId) filters.serviceId = serviceId;
    
    // Provider filter
    const providerId = searchParams.get("providerId");
    if (providerId) filters.providerId = providerId;
    
    // Product filter
    const productId = searchParams.get("productId");
    if (productId) filters.productId = productId;
    
    // Date range
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    
    if (dateFrom || dateTo) {
      filters.createdAt = {};
      if (dateFrom) filters.createdAt.gte = new Date(dateFrom);
      if (dateTo) filters.createdAt.lte = new Date(dateTo);
    }
    
    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const skip = (page - 1) * pageSize;
    
    // For non-admin users, restrict to their complaints
    if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
      if (session.user.role === "AGENT") {
        filters.OR = [
          { submittedById: session.user.id },
          { assignedAgentId: session.user.id }
        ];
      } else {
        filters.submittedById = session.user.id;
      }
    }
    
    // Get total count for pagination
    const totalCount = await db.complaint.count({
      where: filters
    });
    
    // Get complaints
    const complaints = await db.complaint.findMany({
      where: filters,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedAgent: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true
          }
        }
      },
      skip,
      take: pageSize
    });
    
    return NextResponse.json({
      complaints,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return NextResponse.json(
      { error: "Failed to fetch complaints" },
      { status: 500 }
    );
  }
}

// POST - Create a new complaint
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const json = await request.json();
    
    // Validate the request body
    const validatedData = complaintSchema.parse(json);
    
    // Create the complaint
    const complaint = await db.complaint.create({
      data: {
        ...validatedData,
        submittedById: session.user.id,
        statusHistory: {
          create: {
            newStatus: validatedData.status || "NEW",
            changedById: session.user.id
          }
        }
      },
      include: {
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        service: {
          select: {
            id: true,
            name: true
          }
        },
        product: {
          select: {
            id: true,
            name: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    // Record activity log
    await db.activityLog.create({
      data: {
        action: "CREATE_COMPLAINT",
        entityType: "complaint",
        entityId: complaint.id,
        details: `Created complaint: ${complaint.title}`,
        severity: "INFO",
        userId: session.user.id
      }
    });
    
    return NextResponse.json(complaint, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Error creating complaint:", error);
    return NextResponse.json(
      { error: "Failed to create complaint" },
      { status: 500 }
    );
  }
}