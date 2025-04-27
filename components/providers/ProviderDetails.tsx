// /components/providers/ProviderDetails.tsx
"use client";

import React from 'react';
// Uvozimo custom tip ProviderWithDetails
import { ProviderWithDetails } from '@/lib/types/provider-types';
// Uvozimo UI komponente ako su Shadcn UI
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Odkomentarisati ako se koriste Shadcn Card
// import Link from 'next/link'; // Odkomentarisati ako se dodaju linkovi ka povezanim entitetima

interface ProviderDetailsProps {
    provider: ProviderWithDetails; // Očekuje objekat provajdera sa (opcionim) detaljima
}

// Komponenta za prikaz detalja provajdera
export function ProviderDetails({ provider }: ProviderDetailsProps) {
    if (!provider) {
        return <div className="text-muted-foreground text-center">No provider data available.</div>;
    }

    // Koristimo nativne HTML elemente kao u placeholderu
    return (
        <div className="space-y-6">
            {/* Koristiti Shadcn Card ako je importovan */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4"> {/* Zamena za Card */}
                {/* Koristiti Shadcn CardHeader i CardTitle */}
                 <h2 className="text-xl font-semibold">Basic Information</h2> {/* Zamena za CardHeader/Title */}
                {/* Koristiti Shadcn CardContent */}
                <div className="space-y-4"> {/* Zamena za CardContent */}
                    <p><strong>Name:</strong> {provider.name}</p>
                    <p><strong>Contact Name:</strong> {provider.contactName || 'N/A'}</p>
                    <p><strong>Email:</strong> {provider.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {provider.phone || 'N/A'}</p>
                    <p><strong>Address:</strong> {provider.address || 'N/A'}</p>
                    <p><strong>Active:</strong> {provider.isActive ? 'Yes' : 'No'}</p>
                     <p><strong>Created:</strong> {provider.createdAt.toLocaleString()}</p>
                    <p><strong>Updated:</strong> {provider.updatedAt.toLocaleString()}</p>
                </div> {/* Kraj zamene za CardContent */}
            </div> {/* Kraj zamene za Card */}


            {/* Prikazivanje brojača povezanih entiteta ako su dostupni */}
            {provider._count && (
                 // Koristiti Shadcn Card ako je importovan
                 <div className="bg-white rounded-lg shadow p-6 space-y-4"> {/* Zamena za Card */}
                    {/* Koristiti Shadcn CardHeader i CardTitle */}
                    <h2 className="text-xl font-semibold">Related Entities</h2> {/* Zamena za CardHeader/Title */}
                    {/* Koristiti Shadcn CardContent */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Zamena za CardContent */}
                         <p><strong>Contracts:</strong> {provider._count.contracts}</p>
                         <p><strong>VAS Services:</strong> {provider._count.vasServices}</p>
                         <p><strong>Bulk Services:</strong> {provider._count.bulkServices}</p>
                         <p><strong>Complaints:</strong> {provider._count.complaints}</p>
                         {/* Možete dodati linkove ka listama filtriranim po ovom provajderu */}
                     </div> {/* Kraj zamene za CardContent */}
                 </div> {/* Kraj zamene za Card */}
            )}

            {/* Prikazivanje lista povezanih entiteta ako su fetchovane i prosleđene */}
            {/* Primer za ugovore ako su uključeni sa 'include: { contracts: true }' */}
            {/* {provider.contracts && provider.contracts.length > 0 && (
                // Koristiti Shadcn Card ako je importovan
                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                     <h2 className="text-xl font-semibold">Contracts ({provider.contracts.length})</h2>
                    <div>
                        <ul>
                            {provider.contracts.map(contract => (
                                <li key={contract.id}>
                                    <Link href={`/contracts/${contract.id}`} className="text-blue-600 hover:underline">
                                        {contract.contractNumber || contract.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )} */}
            {/* Dodajte slične sekcije za VAS Services, Bulk Services, Complaints */}


        </div>
    );
}