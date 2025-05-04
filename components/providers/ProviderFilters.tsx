// Path: components/providers/ProviderFilters.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react'; // Uvezite useRef
// Pretpostavljamo da postoje UI komponente za inpute i dugmad (koristimo placeholder-e za sada)
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";

// Pretpostavljamo tip Provider (ili ProviderWithCounts)
// import { ProviderWithCounts as Provider } from "@/components/providers/ProviderList"; // Koristimo tip iz liste za sada

// Pretpostavljamo tip za filtere
interface ProviderFilterOptions {
    search?: string; // Pretraga po imenu, kontaktu, emailu, itd.
    isActive?: boolean | null; // Filter po statusu aktivnost (true, false, null za sve)
    // Dodajte ostala polja za filtere ako su potrebna
}

interface ProviderFiltersProps {
    // Callback funkcija koja se poziva kada se filteri promene/primene
    onFilterChange: (filterOptions: ProviderFilterOptions) => void;
    // Dodajte prop za inicijalne filter vrednosti iz URL-a
    initialFilters: ProviderFilterOptions;
}

// Komponenta za filtere liste provajdera
export function ProviderFilters({ onFilterChange, initialFilters }: ProviderFiltersProps) {
    // Inicijalizujte stanje sa vrednostima iz URL-a
    const [search, setSearch] = useState(initialFilters.search || '');
    const [isActive, setIsActive] = useState<boolean | null>(initialFilters.isActive !== undefined ? initialFilters.isActive : null);

    // Ref za debounce timer
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Efekat za debounce pretrage
    useEffect(() => {
        // Očisti prethodni timer ako postoji
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Postavi novi timer
        debounceTimerRef.current = setTimeout(() => {
            // Pozovi onFilterChange sa debouncovanom vrednošću pretrage
            const filterOptions: ProviderFilterOptions = {
                search: search.trim() === '' ? undefined : search.trim(),
                isActive: isActive, // Uključi i isActive u filter opcije
            };
            // console.log("Debounced search or isActive changed:", filterOptions); // Debagovanje
            onFilterChange(filterOptions);
        }, 500); // Debounce period od 500ms (podesite po potrebi)

        // Cleanup funkcija koja se izvršava pre sledećeg pokretanja efekta ili pri unmount-u
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };

    }, [search, isActive, onFilterChange]); // Zavisnosti: search, isActive, i onFilterChange

    // Funkcija za resetovanje filtera
    const handleResetFilters = () => {
        setSearch('');
        setIsActive(null);
        // onFilterChange će se pokrenuti automatski zbog useEffect-a kada se stanje promeni
    };


    return (
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-50 rounded-md">
            {/* Polje za pretragu */}
            <div className="flex-1 w-full sm:w-auto">
                 {/* Placeholder */}
                 <input
                    type="text"
                    placeholder="Search providers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                 />
            </div>

            {/* Filter po statusu aktivnost */}
            <div className="w-full sm:w-auto">
                  {/* Placeholder */}
                 <select
                    value={isActive === null ? 'all' : isActive.toString()}
                    onChange={(e) => setIsActive(e.target.value === 'all' ? null : e.target.value === 'true')}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                 >
                     <option value="all">All Statuses</option>
                     <option value="true">Active</option>
                     <option value="false">Inactive</option>
                 </select>

            </div>

             {/* Dugme za resetovanje filtera */}
              <button
                 type="button"
                 onClick={handleResetFilters}
                 className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input hover:bg-accent px-4 py-2"
              >
                  Reset
              </button>

        </div>
    );
}
