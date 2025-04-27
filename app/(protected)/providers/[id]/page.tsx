// /app/(protected)/providers/[id]/page.tsx
 
import { Metadata } from "next";
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { Provider } from '@prisma/client'; // Uvoz osnovnog Provider modela
 
import { ProviderDetails } from "@/components/providers/ProviderDetails";
 
import { ProviderWithDetails } from '@/lib/types/provider-types';


interface ProviderDetailsPageProps {
    params: {
        id: string;
    };
}

 
async function getProviderDetails(providerId: string): Promise<ProviderWithDetails | null> {
    try {
        const provider = await db.provider.findUnique({
            where: { id: providerId },
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

        // Osiguravamo da se vrati tačan tip
        return provider as ProviderWithDetails | null;

    } catch (error) {
        console.error(`Error fetching provider ${providerId} details from DB:`, error);
        return null;
    }
}

// Generisanje metadata za stranicu
export async function generateMetadata({ params }: ProviderDetailsPageProps): Promise<Metadata> {
     const { id } = await params;
     const provider = await getProviderDetails(id);

     return {
         title: provider ? `${provider.name} | Provider Details` : 'Provider Not Found',
         description: provider ? `Details for provider ${provider.name}.` : 'Details for provider.',
     };
 }

// Glavna Server Komponenta za stranicu detalja provajdera
export default async function ProviderDetailsPage({ params }: ProviderDetailsPageProps) {
    const { id: providerId } = await params;

    const provider = await getProviderDetails(providerId);

    if (!provider) {
        notFound();
    }

    return (
        <div className="p-6 space-y-6">
             <div className="flex items-center justify-between">
                <div>
                     <h1 className="text-2xl font-bold tracking-tight">{provider.name}</h1>
                    <p className="text-gray-500">
                         Details for provider: {provider.id}
                    </p>
                </div>
                 <div className="flex items-center gap-4">
                    <a
                        href={`/providers/${provider.id}/edit`}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
                    >
                        Edit Provider
                    </a>
                 </div>
             </div>
 
                <ProviderDetails provider={provider} />
        </div>
    );
}