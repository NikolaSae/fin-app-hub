// /app/api/contracts/expiring/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db'; // Pretpostavljena putanja do vašeg Prisma klijenta
import { addDays } from 'date-fns'; // Utility za datume
import { ContractStatus } from '@prisma/client'; // Prisma enum za status
// U realnoj aplikaciji, verovatno biste imali middleware ili helper za proveru autentifikacije/autorizacije za /api/ rute
// import { auth } from '@/auth';

// Podrazumevani prag za "uskoro ističe" (u danima)
const DEFAULT_EXPIRY_THRESHOLD_DAYS = 30;

// Handler za GET za dohvatanje ugovora kojima ističe rok
export async function GET(request: NextRequest) {
  // U realnoj aplikaciji, dodali biste proveru autentifikacije/autorizacije
  // const session = await auth();
  // if (!session?.user) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  try {
    const { searchParams } = request.nextUrl;

    // 1. Parsiranje praga broja dana iz query parametara, sa podrazumevanom vrednošću
    const daysParam = searchParams.get('days');
    const daysThreshold = daysParam ? parseInt(daysParam, 10) : DEFAULT_EXPIRY_THRESHOLD_DAYS;

    if (isNaN(daysThreshold) || daysThreshold < 0) {
        return NextResponse.json({ error: "Invalid 'days' parameter. Must be a non-negative number." }, { status: 400 });
    }

    // 2. Izračunavanje datuma praga
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Početak dana za preciznije poređenje
    const expiryDateThreshold = addDays(today, daysThreshold);

    // 3. Dohvatanje aktivnih ugovora kojima ističe rok u okviru praga
    const expiringContracts = await db.contract.findMany({
      where: {
        status: ContractStatus.ACTIVE, // Zanimaju nas samo aktivni ugovori
        endDate: {
          gte: today, // Datum isteka je danas ili u budućnosti
          lte: expiryDateThreshold, // Datum isteka je unutar praga
        },
      },
      orderBy: {
          endDate: 'asc' // Sortiranje po datumu isteka, najraniji prvi
      },
      include: {
        // Uključite relevantne relacije koje frontend prikazuje (kao na listi)
        provider: { select: { id: true, name: true } },
        humanitarianOrg: { select: { id: true, name: true } },
        parkingService: { select: { id: true, name: true } },
      },
    });

    // 4. Vraćanje liste ugovora
    return NextResponse.json(expiringContracts, { status: 200 });

  } catch (error) {
    console.error("Error fetching expiring contracts:", error);
    // Generalna greška servera
    return NextResponse.json({ error: "Failed to fetch expiring contracts." }, { status: 500 });
  }
}

// Napomena: Ova ruta je specifična za dohvatanje liste ugovora kojima ističe rok.
// Kreiranje, ažuriranje ili brisanje ugovora se radi preko /api/contracts ili /api/contracts/[id] ruta.