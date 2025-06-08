// /app/api/contracts/expiring/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { addDays, subDays } from 'date-fns';
import { ContractStatus } from '@prisma/client';

const DEFAULT_EXPIRY_THRESHOLD_DAYS = 60; // Changed to 60 days for two months

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // 1. Parse days threshold parameter
    const daysParam = searchParams.get('days');
    const daysThreshold = daysParam ? parseInt(daysParam, 10) : DEFAULT_EXPIRY_THRESHOLD_DAYS;

    if (isNaN(daysThreshold) || daysThreshold < 0) {
      return NextResponse.json(
        { error: "Invalid 'days' parameter. Must be a non-negative number." },
        { status: 400 }
      );
    }

    // 2. Calculate date range for both past and future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = subDays(today, daysThreshold); // 60 days ago
    const endDate = addDays(today, daysThreshold);   // 60 days from now

    // 3. Fetch contracts with endDate within the range
    const expiringContracts = await db.contract.findMany({
      where: {
        endDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        endDate: 'asc'
      },
      include: {
        provider: { select: { id: true, name: true } },
        humanitarianOrg: { select: { id: true, name: true } },
        parkingService: { select: { id: true, name: true } },
        renewals: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    // 4. Return the list of contracts
    return NextResponse.json(expiringContracts, { status: 200 });

  } catch (error) {
    console.error("Error fetching expiring contracts:", error);
    return NextResponse.json(
      { error: "Failed to fetch expiring contracts." },
      { status: 500 }
    );
  }
}