// actions/contracts/get-expiring-contracts.ts
import { db } from "@/lib/db";
import { addDays, startOfDay, endOfDay } from 'date-fns'; // Fixed import

export async function getExpiringContracts(daysThreshold: number = 30) {
  try {
    const today = startOfDay(new Date());
    const expiryDateThreshold = endOfDay(addDays(today, daysThreshold));
    
    const contracts = await db.contract.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: today,
          lte: expiryDateThreshold,
        },
      },
      select: { // Changed from include to select
        id: true,
        name: true,
        contractNumber: true,
        type: true,
        status: true,
        startDate: true,
        endDate: true,
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
      },
      orderBy: {
        endDate: 'asc'
      }
    });

    console.log(`Found ${contracts.length} expiring contracts`);
    return contracts;

  } catch (error) {
    console.error("Failed to fetch expiring contracts:", error);
    return [];
  }
}