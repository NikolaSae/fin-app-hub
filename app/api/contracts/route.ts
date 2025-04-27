// /app/api/contracts/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db'; // Pretpostavljena putanja do vašeg Prisma klijenta
import { ContractStatus, ContractType } from '@prisma/client'; // Prisma enumi
import { addDays } from 'date-fns'; // Utility za datume
// U realnoj aplikaciji, verovatno biste imali middleware ili helper za proveru autentifikacije/autorizacije za /api/ rute
// import { auth } from '@/auth';

// Opciono: Importovanje Server Akcije za POST (ako želite da delegirate logiku kreiranja)
import { createContract } from '@/actions/contracts/create'; // Akcija koju smo prethodno kreirali

// Handler za GET za dohvatanje liste ugovora
export async function GET(request: NextRequest) {
  // U realnoj aplikaciji, dodali biste proveru autentifikacije/autorizacije
  // const session = await auth();
  // if (!session?.user) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  try {
    const { searchParams } = request.nextUrl;

    // 1. Parsiranje filtera iz query parametara
    const type = searchParams.get('type') as ContractType | null;
    const status = searchParams.get('status') as ContractStatus | null;
    const providerId = searchParams.get('providerId');
    const humanitarianOrgId = searchParams.get('humanitarianOrgId');
    const parkingServiceId = searchParams.get('parkingServiceId');
    const search = searchParams.get('search');
    const expiringWithin = searchParams.get('expiringWithin');
    const limit = searchParams.get('limit');

    // 2. Izgradnja Prisma WHERE klauzule
    const where: any = {};

    if (type && Object.values(ContractType).includes(type)) {
      where.type = type;
    }
    if (status && Object.values(ContractStatus).includes(status)) {
      where.status = status;
    }
    // Zavisni ID-jevi - proveriti da li se poklapaju sa tipom ugovora ako je tip definisan
    // (ova logika bi idealno bila pokrivena robusnijom validacijom)
    if (providerId) where.providerId = providerId;
    if (humanitarianOrgId) where.humanitarianOrgId = humanitarianOrgId;
    if (parkingServiceId) where.parkingServiceId = parkingServiceId;


    if (search) {
      // Implementacija pretrage po relevantnim poljima
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { contractNumber: { contains: search, mode: 'insensitive' as const } },
        // Uključiti pretragu po imenima povezanih entiteta ako je relevantno i efikasno
        // { provider: { name: { contains: search, mode: 'insensitive' as const } } },
        // { humanitarianOrg: { name: { contains: search, mode: 'insensitive' as const } } },
        // { parkingService: { name: { contains: search, mode: 'insensitive' as const } } },
      ];
    }

    // Filter za ugovore kojima ističe rok
    if (expiringWithin) {
      const days = parseInt(expiringWithin, 10);
      if (!isNaN(days) && days >= 0) {
         const today = new Date();
         today.setHours(0, 0, 0, 0);
         const expiryDateThreshold = addDays(today, days);

         where.AND = [
             ...(where.AND || []), // Sačuvaj postojeće AND uslove
             {
                 endDate: {
                     gte: today,
                     lte: expiryDateThreshold,
                 }
             },
             { status: 'ACTIVE' } // Obično nas zanimaju samo aktivni ugovori kojima ističe rok
         ];
         // Uklonimo status 'ACTIVE' iz glavne where klauzule ako je već bio tu, da ne bude redundantno
         if (where.status === 'ACTIVE') delete where.status;
      }
    }


    // 3. Dohvatanje ugovora iz baze
    const contractLimit = limit ? parseInt(limit, 10) : undefined;

    const contracts = await db.contract.findMany({
      where,
      take: contractLimit, // Ograničenje broja rezultata
      orderBy: { createdAt: 'desc' }, // Podrazumevano sortiranje
      include: {
        // Uključite relevantne relacije koje frontend koristi
        provider: { select: { id: true, name: true } },
        humanitarianOrg: { select: { id: true, name: true } },
        parkingService: { select: { id: true, name: true } },
        // Možete dodati i _count za broj servisa, priloga, podsetnika ako je potrebno na listi
        _count: {
             select: { services: true, attachments: true, reminders: true }
        }
      },
    });

    // 4. Opciono: Dohvatanje ukupnog broja rezultata za paginaciju
    const totalCount = await db.contract.count({ where });

    // 5. Vraćanje odgovora
    return NextResponse.json({ contracts, totalCount }, { status: 200 });

  } catch (error) {
    console.error("Error fetching contracts:", error);
    return NextResponse.json({ error: "Failed to fetch contracts." }, { status: 500 });
  }
}


// Handler za POST za kreiranje novog ugovora
// Delegiramo ovu logiku na Server Akciju
export async function POST(request: NextRequest) {
     // U realnoj aplikaciji, dodali biste proveru autentifikacije/autorizacije
     // const session = await auth();
     // if (!session?.user) {
     //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     // }

    try {
        const values = await request.json();

        // Pozivanje Server Akcije za kreiranje ugovora
        const result = await createContract(values);

        if (result.error) {
            // Vraćanje greške dobijene iz akcije
            return NextResponse.json({ error: result.error, details: result.details }, { status: 400 });
        }

        // Vraćanje uspešnog odgovora sa ID-jem novog ugovora
        return NextResponse.json({ success: result.success, id: result.id }, { status: 201 });

    } catch (error) {
        console.error("Error creating contract via API:", error);
        // Generalna greška servera
        return NextResponse.json({ error: "Failed to create contract." }, { status: 500 });
    }
}