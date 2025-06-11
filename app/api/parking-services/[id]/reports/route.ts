// app/api/parking-services/[id]/reports/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const parkingServiceId = params.id;

  try {
    // Pretpostavimo da postoji tabela parkingReports sa kolonom parkingServiceId
    const reports = await prisma.parkingReport.findMany({
      where: { parkingServiceId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        status: true,
      },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
