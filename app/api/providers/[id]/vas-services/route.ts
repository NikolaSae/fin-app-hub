// Path: app/api/providers/[id]/vas-services/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ServiceType } from "@prisma/client";

export async function GET(
  req: Request,
  { params: { id } }: { params: { id: string } } // IZMENA: Destrukturirano 'id' direktno iz params
) {
  try {
    const providerId = id; // Koristimo destrukturirani 'id'

    if (!providerId) {
      return new NextResponse("Provider ID is required", { status: 400 });
    }

    // Verify that the provider exists
    const provider = await db.provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return new NextResponse("Provider not found", { status: 404 });
    }

    // Get services of type 'VAS' that are associated with this provider
    // via the VasService model.
    const services = await db.service.findMany({
      where: {
        type: ServiceType.VAS,
        vasServices: {
          some: {
            provajderId: providerId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    console.log(`Found ${services.length} VAS services for provider ${providerId}`);

    return NextResponse.json(services);
  } catch (error) {
    console.error("[VAS_SERVICES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}