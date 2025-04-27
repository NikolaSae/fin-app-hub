// /hooks/use-humanitarian-org-contracts.ts
'use client';

import { useState, useEffect } from 'react';
// Uvozimo custom tip za ugovore sa uključenim obnovama
import { ContractWithRenewals } from '@/lib/types/humanitarian-org-types';

interface UseHumanitarianOrgContractsResult {
  contracts: ContractWithRenewals[];
  loading: boolean;
  error: Error | null;
  // Opciono: funkcija za osvežavanje podataka
  // refresh: () => void;
}

/**
 * Hook za dohvatanje ugovora povezanih sa specifičnom humanitarnom organizacijom.
 * Komunicira sa API rutom /api/humanitarian-orgs/[id]/contracts.
 * @param orgId - ID humanitarne organizacije čije ugovore dohvatamo.
 * @returns Objekat sa listom ugovora, statusom učitavanja i greškom.
 */
export function useHumanitarianOrgContracts(orgId: string | null): UseHumanitarianOrgContractsResult {
    const [contracts, setContracts] = useState<ContractWithRenewals[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Funkcija za dohvatanje podataka (nije memoizovana jer zavisi samo od orgId)
    const fetchContracts = async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            // Pozivanje API rute za dohvatanje ugovora za datu organizaciju
            const response = await fetch(`/api/humanitarian-orgs/${id}/contracts`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to fetch associated contracts: ${response.status}`);
            }

            // Očekujemo listu ugovora tipa ContractWithRenewals[]
            const data: ContractWithRenewals[] = await response.json();
            setContracts(data || []);

        } catch (err) {
            console.error(`Error fetching contracts for organization ${id}:`, err);
            setError(err instanceof Error ? err : new Error('Failed to fetch associated contracts.'));
            setContracts([]); // Resetuj listu u slučaju greške
        } finally {
            setLoading(false);
        }
    };

    // Efekat za dohvatanje podataka kada se orgId promeni ili pri montiranju (ako orgId postoji)
    useEffect(() => {
        // Dohvati podatke samo ako imamo važeći orgId
        if (orgId) {
            fetchContracts(orgId);
        } else {
             // Resetuj stanje ako nema orgId (npr. na novoj stranici pre nego što se izabere org)
             setContracts([]);
             setLoading(false);
             setError(null);
        }
        // Dependency array: orgId osigurava da se fetch pokrene ponovo ako se ID promeni
        // fetchContracts se ne stavlja u dependency array jer nije memoizovana, a poziva se direktno
    }, [orgId]);

     // Opciono: Funkcija za ručno osvežavanje
     // const refresh = useCallback(() => {
     //     if (orgId) {
     //          fetchContracts(orgId);
     //     }
     // }, [orgId]);


    return {
        contracts, // Izlažemo listu ugovora
        loading, // Izlažemo status učitavanja
        error, // Izlažemo grešku
        // refresh, // Izlažemo funkciju za osvežavanje
    };
}