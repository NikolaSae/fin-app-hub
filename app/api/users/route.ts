// app/api/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Only admins can query users
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const roles = searchParams.get("roles");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    
    // Build the query
    const where: any = {};
    
    // Filter by roles if specified
    if (roles) {
      const roleArray = roles.split(',');
      where.role = {
        in: roleArray
      };
    }
    
    // Execute the query
    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
    
    // Get total count for pagination
    const totalCount = await db.user.count({ where });
    
    return NextResponse.json({
      users,
      meta: {
        total: totalCount,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("Error retrieving users:", error);
    return NextResponse.json({ error: "Failed to retrieve users" }, { status: 500 });
  }
}