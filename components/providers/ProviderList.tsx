// /components/providers/ProviderList.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// Pretpostavljamo uvoz UI komponenti ako su Shadcn UI:
import { Button } from "@/components/ui/button"; // Odkomentarisati ako se koriste Shadcn buttoni
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Odkomentarisati ako se koriste Shadcn table


import { useProviders } from "@/hooks/use-providers";

import { ProviderFilters } from "@/components/providers/ProviderFilters";

import { ProviderWithCounts, ProviderFilterOptions } from "@/lib/types/provider-types";




// Komponenta za prikaz liste provajdera (više ne prima prop listu)
export function ProviderList() { // Uklonjeni propovi
    const router = useRouter();

    // Stanje za filter opcije koje ProviderFilters menja
    const [filters, setFilters] = useState<ProviderFilterOptions>({});
    // Stanje za paginaciju (ako implementirate)
    // const [pagination, setPagination] = useState({ page: 1, limit: 10 });

    // Dohvaćanje podataka koristeći useProviders hook
    const { providers, totalCount, loading, error } = useProviders(
        filters, // Prosleđujemo trenutne filtere hooku
        { page: 1, limit: 100 } // Prosledite paginaciju ako je koristite
         // Možete proslediti i praznu paginaciju { } ako ne želite limit/offset
    );

    // Funkcija koja se prosleđuje ProviderFilters komponenti
    const handleFilterChange = (filterOptions: ProviderFilterOptions) => {
        // Ažurirajte stanje filtera u ovoj komponenti
        setFilters(filterOptions);
        // Ako koristite paginaciju, resetujte na prvu stranicu pri promeni filtera
        // setPagination(prev => ({ ...prev, page: 1 }));
    };

    // Memoizacija za izvedene podatke ako je potrebno (npr. formatiranje)
    // const formattedProviders = useMemo(() => { ... }, [providers]);


    // Prikazivanje stanja učitavanja ili greške
    if (loading) {
        // Renderujte skeleton ili poruku za učitavanje
         return <div className="text-center py-4 text-muted-foreground">Loading providers...</div>;
    }

    if (error) {
        // Renderujte poruku o grešci
         return <div className="text-center py-4 text-red-500">Error loading providers: {error.message}</div>;
    }


    return (
        <div className="space-y-4">
            <ProviderFilters onFilterChange={handleFilterChange} />


            <div className="rounded-md border">
                
                <table> {/* Koristiti Shadcn Table ako je importovan */}
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Contact Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Active</th>
                            <th>Contracts Count</th>
                            <th>Complaints Count</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                       
                        {providers.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center py-4 text-muted-foreground">
                                    No providers found.
                                </td>
                            </tr>
                        ) : (
                            providers.map((provider) => {
                                return (
                                    <tr key={provider.id}>
                                        <td> 
                                             <Link
                                                 href={`/providers/${provider.id}`}
                                                className="text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                {provider.name}
                                            </Link>
                                        </td>
                                        <td>{provider.contactName || 'N/A'}</td> 
                                        <td>{provider.email || 'N/A'}</td> 
                                        <td>{provider.phone || 'N/A'}</td> 
                                         <td>{provider.isActive ? 'Yes' : 'No'}</td> 
                                          {/* Prikaz brojača iz _count */}
                                         <td>{provider._count?.contracts ?? 0}</td> 
                                          <td>{provider._count?.complaints ?? 0}</td> 
                                        <td className="text-right"> {/* Koristiti Shadcn TableCell */}
                                            <button
                                                onClick={() => router.push(`/providers/${provider.id}`)}
                                                className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input hover:bg-accent px-3 py-1.5" // Osnovni stil dugmeta
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>


        </div>
    );
}