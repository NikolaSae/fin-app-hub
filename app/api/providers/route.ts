// /app/api/providers/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';
// Uvozimo custom tipove
import { ProviderWithCounts, ProviderFilterOptions, ProvidersApiResponse } from '@/lib/types/provider-types';
// Uvozimo Server Akciju za POST
import { createProvider } from '@/actions/providers/create';
// U realnoj aplikaciji, verovatno biste imali middleware ili helper za proveru autentifikacije/autorizacije
// import { auth } from '@/auth';


// Handler za GET za dohvatanje liste provajdera
export async function GET(request: NextRequest) {
    // U realnoj aplikaciji, dodali biste proveru autentifikacije/autorizacije
    // const session = await auth();
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    try {
        const { searchParams } = request.nextUrl;

        // 1. Parsiranje filtera iz query parametara
        // Koristimo tip ProviderFilterOptions kao referencu
        const search = searchParams.get('search');
        const isActiveParam = searchParams.get('isActive');

        let isActive: boolean | null = null;
        if (isActiveParam === 'true') {
            isActive = true;
        } else if (isActiveParam === 'false') {
            isActive = false;
        }

         const limit = searchParams.get('limit');
         const offset = searchParams.get('offset');
         const take = limit ? parseInt(limit, 10) : undefined;
         const skip = offset ? parseInt(offset, 10) : undefined;

        // 2. Izgradnja Prisma WHERE klauzule
        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' as const } },
                { contactName: { contains: search, mode: 'insensitive' as const } },
                { email: { contains: search, mode: 'insensitive' as const } },
                { phone: { contains: search, mode: 'insensitive' as const } },
                { address: { contains: search, mode: 'insensitive' as const } },
            ];
        }

        if (isActive !== null) {
            where.isActive = isActive;
        }

        // 3. Dohvatanje provajdera iz baze
        const providers = await db.provider.findMany({
            where,
            take,
            skip,
            orderBy: { name: 'asc' },
            include: {
                  _count: {
                      select: { contracts: true, vasServices: true, bulkServices: true, complaints: true }
                  }
            }
        });

         // 4. Dohvatanje ukupnog broja rezultata
         const totalCount = await db.provider.count({ where });


        // 5. Vraćanje odgovora, koristeći ProvidersApiResponse tip
        const apiResponse: ProvidersApiResponse = {
            providers: providers as ProviderWithCounts[], // Kastovanje na custom tip
            totalCount: totalCount,
        };
        return NextResponse.json(apiResponse, { status: 200 });

    } catch (error) {
        console.error("Error fetching providers:", error);
        return NextResponse.json({ error: "Failed to fetch providers." }, { status: 500 });
    }
}


// Handler za POST za kreiranje novog provajdera
// Delegiramo ovu logiku na Server Akciju
export async function POST(request: NextRequest) {
     // U realnoj aplikaciji, dodali biste proveru autentifikacije/autorizacije
     // const session = await auth();
     // if (!session?.user) {
     //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     // }

    try {
        const values = await request.json();

        // Pozivanje Server Akcije za kreiranje provajdera
        // createProvider akcija očekuje ProviderFormData tip
        const result = await createProvider(values);

        if (result.error) {
            if (result.details) {
                 return NextResponse.json({ error: result.error, details: result.details }, { status: 400 });
             }
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        // Vraćanje uspešnog odgovora
        return NextResponse.json({ success: result.success, id: result.id }, { status: 201 });

    } catch (error) {
        console.error("Error creating provider via API:", error);
        return NextResponse.json({ error: "Failed to create provider." }, { status: 500 });
    }
}