// app/api/complaints/[id]/assign/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {

    const session = await auth();
    
    // Check authentication
    if (!session?.user?.role === "ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }
    
    // Only allow admins to assign complaints
    if (session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }
    
    const { id } = await params;
    const { assignedToId, assignedById  } = await req.json();
    
    if (!assignedToId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    
    // Verify the complaint exists
    const complaint = await db.complaint.findUnique({
      where: { id }
    });
    
    if (!complaint) {
      return new NextResponse("Complaint not found", { status: 404 });
    }
    
    // Update the complaint with the new assignee
    const updatedComplaint = await db.complaint.update({
      where: { id },
      data: {
        assignedToId,
        // If the complaint was pending, set it to in progress
        status: complaint.status === "PENDING" ? "IN_PROGRESS" : complaint.status,
      }
    });
    
    // Create a history entry for this change
    await db.complaintHistory.create({
      data: {
        complaintId: id,
        userId: session.user.id,
        description: `Assigned to user ID: ${assignedToId}`,
        newStatus: "IN_PROGRESS",
      }
    });
    
    return NextResponse.json({ success: "Complaint assigned successfully" });
  } catch (error) {
    console.error("[COMPLAINT_ASSIGN]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}