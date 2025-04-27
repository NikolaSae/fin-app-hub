// /app/(protected)/humanitarian-orgs/[id]/page.tsx

import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from 'next/navigation';
import { db } from '@/lib/db'; // Pretpostavljena putanja do vašeg Prisma klijenta
// Uvozimo custom tip sa detaljima
import { HumanitarianOrgWithDetails } from '@/lib/types/humanitarian-org-types';
// Uvozimo komponente za prikaz detalja i ugovora
// Komponenta HumanitarianOrgDetails će biti kreirana u sledećim koracima
import { HumanitarianOrgDetails } from "@/components/humanitarian-orgs/HumanitarianOrgDetails";
import { HumanitarianOrgContracts } from "@/components/humanitarian-orgs/HumanitarianOrgContracts"; // Ova komponenta je već generisana


interface HumanitarianOrgDetailsPageProps {
    params: {
        id: string; // ID humanitarne organizacije iz dinamičkog segmenta rute
    };
}

// Funkcija za dohvatanje detalja humanitarne organizacije sa uključenim relacijama
async function getHumanitarianOrgDetails(orgId: string): Promise<HumanitarianOrgWithDetails | null> {
    try {
        // Dohvatanje organizacije po ID-u, sa uključenim relacijama
        const organization = await db.humanitarianOrg.findUnique({
            where: { id: orgId },
            include: {
                 contracts: {
                     select: {
                         id: true,
                         name: true,
                         contractNumber: true,
                         status: true,
                         startDate: true,
                         endDate: true,
                         type: true,
                         revenuePercentage: true,
                         // Uključujemo povezani HumanitarianContractRenewal model
                         humanitarianRenewals: {
                              select: {
                                  id: true,
                                  subStatus: true, // Sub-status obnove
                                  renewalStartDate: true,
                                  proposedStartDate: true,
                                  createdAt: true, // Važno za sortiranje
                              },
                              // Sortiramo obnove da bismo lako došli do poslednje
                              orderBy: { createdAt: 'desc' },
                              take: 1, // Uzmi samo poslednju obnovu
                         },
                         // Dodajte druge include relacije ugovora ako su potrebne
                     },
                     orderBy: { endDate: 'desc' }, // Sortiranje ugovora
                 },
                 complaints: {
                      select: { id: true, title: true, status: true, createdAt: true }, // Primer uključenih reklamacija
                 },
                 // Uključite i druge relacije ako su potrebne na stranici detalja
                 humanitarianRenewals: true, // Ako postoji direktna relacija ka obnovama (manje verovatno)
                 _count: {
                     select: { contracts: true, complaints: true, humanitarianRenewals: true }
                 }
            }
        });

        // Osiguravamo da se vrati tačan tip
        return organization as HumanitarianOrgWithDetails | null;

    } catch (error) {
        console.error(`Error fetching humanitarian organization ${orgId} details from DB:`, error);
        return null;
    }
}

// Generisanje metadata za stranicu
export async function generateMetadata({ params }: HumanitarianOrgDetailsPageProps): Promise<Metadata> {
     // Sačekaj params pre pristupanja svojstvima
     const { id } = await params;
     const organization = await getHumanitarianOrgDetails(id);

     return {
         title: organization ? `${organization.name} | Organization Details` : 'Organization Not Found',
         description: organization ? `Details for humanitarian organization ${organization.name}.` : 'Details for organization.',
     };
 }


// Glavna Server Komponenta za stranicu detalja humanitarne organizacije
export default async function HumanitarianOrgDetailsPage({ params }: HumanitarianOrgDetailsPageProps) {
    // Sačekaj params pre pristupanja svojstvima
    const { id: orgId } = await params;

    const organization = await getHumanitarianOrgDetails(orgId);

    // Ako organizacija nije pronađena, prikaži 404 stranicu
    if (!organization) {
        notFound();
    }

    // Izdvajamo listu ugovora za prosleđivanje komponenti
    const associatedContracts = organization.contracts || [];

    return (
        <div className="p-6 space-y-6">
             <div className="flex items-center justify-between">
                <div>
                     <h1 className="text-2xl font-bold tracking-tight">{organization.name}</h1>
                    <p className="text-gray-500">
                         Details for humanitarian organization: {organization.id}
                    </p>
                </div>
                 <div className="flex items-center gap-4">
                    // Link za editovanje organizacije
                    <a
                        href={`/humanitarian-orgs/${organization.id}/edit`}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
                    >
                        Edit Organization
                    </a>
                    // Opciono: Dugme za brisanje
                 </div>
             </div>

            // Suspense boundary ako unutrašnje komponente imaju async rad
             <Suspense fallback={<div>Loading organization details...</div>}>
                // Renderujemo komponentu za osnovne detalje organizacije
                // Prosleđujemo kompletan objekat organizacije
                <HumanitarianOrgDetails organization={organization} />


                // Renderujemo komponentu za prikaz povezanih ugovora
                // Prosleđujemo listu ugovora (sa uključenim obnovama)
                 <HumanitarianOrgContracts contracts={associatedContracts} />


            </Suspense>
        </div>
    );
}