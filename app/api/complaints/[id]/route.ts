// app/api/complaints/[id]/route.ts



import { NextResponse } from "next/server";
import { getComplaintById, assignComplaintToUser } from "@/data/complaint";
import { auth } from "@/auth";

// GET - Fetch a complaint by ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const complaint = await getComplaintById(id);
    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found." }, { status: 404 });
    }

    return NextResponse.json(complaint);
  } catch (error) {
    console.error("[GET_COMPLAINT]", error);
    return NextResponse.json({ error: "Failed to fetch complaint." }, { status: 500 });
  }
}

// POST - Assign a complaint to a user
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth(); // Validate session
  if (!session || !session.user) {
    return NextResponse.redirect(`/auth/login?callbackUrl=${req.url}`); // Redirect to login
  }

  try {
    const { assignedToId } = await req.json();

    if (!assignedToId) {
      return NextResponse.json({ error: "Invalid data. 'assignedToId' is required." }, { status: 400 });
    }

    const updatedComplaint = await assignComplaintToUser(params.id, assignedToId);
    return NextResponse.json(updatedComplaint);
  } catch (error) {
    console.error("[POST_ASSIGN_COMPLAINT]", error);
    return NextResponse.json({ error: "Failed to assign complaint." }, { status: 500 });
  }
}

