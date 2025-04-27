// /app/api/services/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { ServiceType } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all service categories (types)
    const serviceTypes = Object.values(ServiceType);
    
    // Get counts of services per category
    const servicesPerCategory = await Promise.all(
      serviceTypes.map(async (type) => {
        const count = await db.service.count({
          where: {
            type,
            isActive: true,
          },
        });
        
        return {
          type,
          count,
        };
      })
    );
    
    // Get sample services for each category (limited to 5 per category)
    const servicesWithSamples = await Promise.all(
      serviceTypes.map(async (type) => {
        const services = await db.service.findMany({
          where: {
            type,
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            description: true,
          },
          take: 5, // Limit to 5 samples
        });
        
        return {
          type,
          count: servicesPerCategory.find(c => c.type === type)?.count || 0,
          samples: services,
        };
      })
    );
    
    // Add complaint counts per category if user is admin or manager
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });
    
    if (["ADMIN", "MANAGER"].includes(user?.role || "")) {
      const complaintCountsByServiceType = await Promise.all(
        serviceTypes.map(async (type) => {
          const complaints = await db.complaint.count({
            where: {
              service: {
                type,
              },
            },
          });
          
          return {
            type,
            complaintCount: complaints,
          };
        })
      );
      
      // Merge complaint counts into the response
      servicesWithSamples.forEach(category => {
        category.complaintCount = complaintCountsByServiceType.find(
          c => c.type === category.type
        )?.complaintCount || 0;
      });
    }

    return NextResponse.json(servicesWithSamples);
  } catch (error) {
    console.error("[SERVICE_CATEGORIES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}