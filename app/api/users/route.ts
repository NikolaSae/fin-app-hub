// app/api/users/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    
    // Check authentication
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Only allow admins or agents to fetch user list
    if (session.user.role !== "ADMIN" && session.user.role !== "AGENT") {
      return new NextResponse("Forbidden", { status: 403 });
    }
    
    // Fetch eligible users
    const users = await db.user.findMany({
      where: {
        // Filter criteria if needed
        // e.g., only agents and admins
        role: {
          in: ["ADMIN", "USER"]
        }
      },
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error("[USERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}