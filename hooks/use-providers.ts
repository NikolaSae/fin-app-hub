// /hooks/use-providers.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
// Uvozimo definisane tipove iz našeg lib/types fajla
import { ProviderWithCounts, ProviderFilterOptions, ProvidersApiResponse } from '@/lib/types/provider-types';

interface UseProvidersResult {
  providers: ProviderWithCounts[];
  totalCount: number;
  loading: boolean;
  error: Error | null;
  // Izložiti funkcije za promenu filtera i paginacije ako hook upravlja njima
   setFilters: (filters: ProviderFilterOptions) => void;
   // setPagination: (pagination: { page: number; limit: number }) => void;
   refresh: () => void; // Funkcija za ručno osvežavanje
}

/**
 * Hook za dohvatanje, filtriranje i (opciono) paginaciju liste provajdera sa servera.
 * Upravlja stanjem filtera i paginacije interno i pokreće fetch kada se promene.
 * @param initialFilters - Početne opcije filtera.
 * @param initialPagination - Početne opcije paginacije (npr. { page: 1, limit: 10 }).
 * @returns Objekat sa listom provajdera, ukupnim brojem, statusom učitavanja, greškom i funkcijama za manipulaciju.
 */
// Menjamo da prima samo inicijalne vrednosti, a interno upravlja stanjem filtera/paginacije
export function useProviders(
    initialFilters: ProviderFilterOptions = {},
    initialPagination: { page?: number; limit?: number } = { page: 1, limit: 100 } // Podrazumevana paginacija
): UseProvidersResult {
    const [providers, setProviders] = useState<ProviderWithCounts[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    // Stanje filtera kojim hook upravlja
    const [filters, setFiltersState] = useState<ProviderFilterOptions>(initialFilters);
    // Stanje paginacije kojim hook upravlja
    const [pagination, setPaginationState] = useState(initialPagination);


    // Funkcija za dohvatanje podataka (memoizovana)
    const fetchProviders = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Priprema URL query parametara iz TRENUTNOG stanja filtera i paginacije
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.isActive !== null && filters.isActive !== undefined) {
                 params.append('isActive', filters.isActive.toString());
            }
            // Dodajte ostale filtere...

            // Dodajte parametre za paginaciju
            if (pagination.limit) params.append('limit', pagination.limit.toString());
            if (pagination.page && pagination.limit) {
                 params.append('offset', ((pagination.page - 1) * pagination.limit).toString());
            }

            // Pozivanje API rute
            const response = await fetch(`/api/providers?${params.toString()}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to fetch providers: ${response.status}`);
            }

            const data: ProvidersApiResponse = await response.json(); // Očekujemo { providers: [...], totalCount: ... }
            setProviders(data.providers || []);
            setTotalCount(data.totalCount || 0);

        } catch (err) {
            console.error("Error fetching providers:", err);
            setError(err instanceof Error ? err : new Error('Failed to fetch providers.'));
            setProviders([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, [filters, pagination]); // Zavisnosti: fetch se ponovo kreira (i pokreće useEffect) samo kad se filteri ili paginacija promene


    // Efekat za dohvatanje podataka pri montiranju ili promeni stanja filtera/paginacije
    useEffect(() => {
        fetchProviders(); // Pozivamo fetch funkciju
    }, [fetchProviders]); // Zavisnost: fetchProviders funkcija (koja se menja samo kad se filteri/paginacija promene)


    // Implementacija funkcija za promenu filtera/paginacije koje se izlažu hookom
    const setFilters = useCallback((newFilters: ProviderFilterOptions) => {
         // Možete mergovati nove filtere sa postojećim ako je potrebno
         // setFiltersState(prevFilters => ({ ...prevFilters, ...newFilters }));
         setFiltersState(newFilters); // Jednostavno zamenjujemo filtere
         // Resetuj na prvu stranicu pri promeni filtera
         setPaginationState(prev => ({ ...prev, page: 1 }));
    }, []);

     const setPagination = useCallback((newPagination: { page: number; limit: number }) => {
         setPaginationState(newPagination);
     }, []);

     const refresh = useCallback(() => {
         fetchProviders(); // Ponovo dohvati sa trenutnim stanjem filtera/paginacije
     }, [fetchProviders]);


    return {
        providers,
        totalCount,
        loading,
        error,
        setFilters, // Izložiti funkciju za promenu filtera
        // setPagination, // Izložiti funkciju za promenu paginacije ako je potrebno
        refresh, // Izložiti funkciju za osvežavanje
    };
}