// app/api/complaints/route.ts


import { NextResponse } from "next/server";
import { getAllComplaints } from "@/data/complaint"; // Ensure your data logic for complaints is in `/data/complaints.ts`

// GET - Fetch all complaints
export async function GET() {
  try {
    const complaints = await getAllComplaints(); // Your Prisma function
    return NextResponse.json(complaints);
  } catch (error) {
    console.error("[GET_COMPLAINTS]", error);
    return NextResponse.json({ error: "Failed to fetch complaints." }, { status: 500 });
  }
}


