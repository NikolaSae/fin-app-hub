// app/api/services-vas/route.ts


import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const providers = await db.provajder.findMany({
      include: {
        vasServices: true,
        bulkServices: true,
        parkingServices: true,
        humanServices: true,
      },
    });

    return NextResponse.json({ providers });
  } catch (error) {
    console.error("Error fetching providers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
