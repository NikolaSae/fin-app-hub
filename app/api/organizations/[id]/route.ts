// app/api/organizations/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth"; // NextAuth v5 stil
import { 
  getOrganizationById, 
  updateOrganization,
  deleteOrganization,
  getOrganizationHistory
} from "@/lib/organizations";
import { UserRole } from "@prisma/client";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Wait for params to resolve
    const { id } = await params;  

    // Fetch organization data using the id
    const organization = await getOrganizationById(id);
    
    if (!organization) {
      // If no organization is found, return 404 status
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }
    
    // Return the organization data with a 200 status code
    return NextResponse.json(organization, { status: 200 });
  } catch (error) {
    console.error("Error fetching organization:", error);
    // If an error occurs, return a 500 status code with a message
    return NextResponse.json({ error: "Failed to fetch organization data" }, { status: 500 });
  }
}

// PATCH /api/organizations/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await req.json();

    if (data.datumPocetka) {
      data.datumPocetka = new Date(data.datumPocetka);
    }

    if (data.datumIsteka) {
      data.datumIsteka = new Date(data.datumIsteka);
    }

    // Čekamo da se params razreši
    const { id } = await params;  // Dodajemo await za razrešenje params
    const organization = await updateOrganization(
      id,
      data,
      session.user.id
    );

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Error updating organization:", error);
    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Čekamo da se params razreši
    const { id } = await params;  // Dodajemo await za razrešenje params
    await deleteOrganization(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting organization:", error);
    return NextResponse.json(
      { error: "Failed to delete organization" },
      { status: 500 }
    );
  }
}
