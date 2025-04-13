import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth"; // NextAuth v5
import { getOrganizationHistory } from "@/lib/organizations";

// GET /api/organizations/[id]/history
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Čekamo da se params razreši
    const { id } = await params;  // Dodajemo await za razrešenje params
    const history = await getOrganizationHistory(id);

    return NextResponse.json(history);
  } catch (error) {
    console.error("Error getting organization history:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization history" },
      { status: 500 }
    );
  }
}
