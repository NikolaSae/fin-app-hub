// /app/api/providers/[id]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';
// Uvozimo custom tip ProviderWithDetails
import { ProviderWithDetails } from '@/lib/types/provider-types';
// Importovanje Server Akcija za PUT i DELETE
import { updateProvider } from '@/actions/providers/update';
import { deleteProvider } from '@/actions/providers/delete';
// U realnoj aplikaciji, verovatno biste imali middleware ili helper za proveru autentifikacije/autorizacije
// import { auth } from '@/auth';


// Handler za GET za dohvatanje pojedinačnog provajdera po ID-u
// Vraćamo tip ProviderWithDetails
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
): Promise<NextResponse<ProviderWithDetails | { error: string }>> { // Explicitno tipiziramo povratnu vrednost
    // U realnoj aplikaciji, dodali biste proveru autentifikacije/autorizacije
    // const session = await auth();
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { id } = params;

    try {
        const provider = await db.provider.findUnique({
            where: { id },
             include: {
                  contracts: { select: { id: true, name: true, contractNumber: true, status: true, endDate: true } },
                  vasServices: { select: { id: true, proizvod: true, mesec_pruzanja_usluge: true, naplacen_iznos: true } },
                  bulkServices: { select: { id: true, service_name: true, requests: true } },
                  complaints: { select: { id: true, title: true, status: true, createdAt: true } },
                 _count: {
                      select: { contracts: true, vasServices: true, bulkServices: true, complaints: true }
                 }
             }
        });

        if (!provider) {
            return NextResponse.json({ error: "Provider not found." }, { status: 404 });
        }

        // Vraćanje podataka, kastovano na custom tip
        return NextResponse.json(provider as ProviderWithDetails, { status: 200 });

    } catch (error) {
        console.error(`Error fetching provider with ID ${id}:`, error);
        return NextResponse.json({ error: "Failed to fetch provider." }, { status: 500 });
    }
}


// Handler za PUT za ažuriranje provajdera po ID-u
// Delegiramo ovu logiku na Server Akciju (updateProvider očekuje ProviderFormData)
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
     // U realnoj aplikaciji, dodali biste proveru autentifikacije/autorizacije
     // const session = await auth();
     // if (!session?.user) {
     //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     // }

    const { id } = params;

    try {
        const values = await request.json();

        // Pozivanje Server Akcije za ažuriranje provajdera
        // updateProvider akcija očekuje ID i ProviderFormData tip
        const result = await updateProvider(id, values);

        if (result.error) {
             if (result.error === "Provider not found.") {
                return NextResponse.json({ error: result.error }, { status: 404 });
             }
             if (result.details) {
                 return NextResponse.json({ error: result.error, details: result.details }, { status: 400 });
             }
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        // Vraćanje uspešnog odgovora
        return NextResponse.json({ success: result.success, id: result.id }, { status: 200 });

    } catch (error) {
        console.error(`Error updating provider with ID ${id} via API:`, error);
        return NextResponse.json({ error: "Failed to update provider." }, { status: 500 });
    }
}


// Handler za DELETE za brisanje provajdera po ID-u
// Delegiramo ovu logiku na Server Akciju
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
     // U realnoj aplikaciji, dodali biste proveru autentifikacije/autorizacije
     // const session = await auth();
     // if (!session?.user) {
     //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     // }

    const { id } = params;

    try {
        // Pozivanje Server Akcije za brisanje provajdera
        const result = await deleteProvider(id);

        if (result.error) {
             if (result.error === "Provider not found.") {
                return NextResponse.json({ error: result.error }, { status: 404 });
             }
             if (result.error.includes("Cannot delete provider because it is associated")) {
                return NextResponse.json({ error: result.error }, { status: 409 });
             }
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        // Vraćanje uspešnog odgovora
        return NextResponse.json({ success: result.success }, { status: 200 }); // Ili status: 204

    } catch (error) {
        console.error(`Error deleting provider with ID ${id} via API:`, error);
        return NextResponse.json({ error: "Failed to delete provider." }, { status: 500 });
    }
}