// app/api/organizations/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

import { 
  getAllOrganizations, 
  createOrganization 
} from "@/lib/organizations";
import { UserRole } from "@prisma/client";

// GET /api/organizations
export async function GET() {
  try {
    const organizations = await getAllOrganizations();
    return NextResponse.json(organizations);
  } catch (error) {
    console.error("Error getting organizations:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 }
    );
  }
}

// POST /api/organizations
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await req.json();

    // Validacija datuma
    data.datumPocetka = new Date(data.datumPocetka);
    data.datumIsteka = new Date(data.datumIsteka);

    const organization = await createOrganization(data, session.user.id);

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }
}
