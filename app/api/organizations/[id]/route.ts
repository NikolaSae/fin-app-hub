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

export async function GET(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    const organization = await getOrganizationById(params.id);
    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }
    return NextResponse.json(organization);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to fetch organization" }, { status: 500 });
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
