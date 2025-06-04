// app/api/sender-blacklist/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { SenderBlacklistWithProvider } from "@/lib/types/blacklist";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const search = searchParams.get("search") || "";
  const providerId = searchParams.get("providerId") || "";

  try {
    const skip = (page - 1) * pageSize;
    
    const where: any = {};
    if (search) {
      where.senderName = {
        contains: search,
        mode: "insensitive",
      };
    }
    if (providerId) {
      where.providerId = providerId;
    }

    const [rawEntries, total] = await Promise.all([
      db.senderBlacklist.findMany({
        skip,
        take: pageSize,
        where,
        include: {
          // REMOVED INVALID PROVIDER RELATION
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      db.senderBlacklist.count({ where }),
    ]);

    // Add null provider to satisfy type requirements
    const entries = rawEntries.map(entry => ({
      ...entry,
      provider: null
    }));

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      entries: entries as SenderBlacklistWithProvider[],
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("[GET_BLACKLIST_ERROR]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}