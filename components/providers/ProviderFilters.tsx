// /components/providers/ProviderFilters.tsx
"use client";

import React, { useState, useEffect } from 'react';
// Pretpostavljamo da postoje UI komponente za inpute i dugmad
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
    // Očekuje se lista svih provajdera ako se filtriranje vrši klijentski unutar roditelja
    // Ako filteri rade u kombinaciji sa hookom koji fetchuje sa servera, ovaj prop možda nije potreban
    // providers: Provider[]; // Opciono: ako se filtrira klijentski

    // Callback funkcija koja se poziva kada se filteri promene/primene
    // Očekuje se da ova funkcija primi novu listu filtriranih provajdera (klijentsko filtriranje)
    // ILI objekat filter opcija koji će hook koristiti za server-side filtriranje
    onFilterChange: (filterOptions: ProviderFilterOptions) => void; // Koristimo pristup sa slanjem filter opcija
}

// Komponenta za filtere liste provajdera
export function ProviderFilters({ onFilterChange }: ProviderFiltersProps) {
    const [search, setSearch] = useState('');
    const [isActive, setIsActive] = useState<boolean | null>(null); // null = All, true = Active, false = Inactive

    // Efekat koji poziva onFilterChange kad god se filteri promene (debounce bi bio bolji za search)
    useEffect(() => {
        const filterOptions: ProviderFilterOptions = {
            search: search.trim() === '' ? undefined : search.trim(),
            isActive: isActive,
        };
        // console.log("Filter options changed:", filterOptions); // Debagovanje
        onFilterChange(filterOptions);

    }, [search, isActive, onFilterChange]); // Zavisnosti efekta


    // Funkcija za resetovanje filtera
    const handleResetFilters = () => {
        setSearch('');
        setIsActive(null);
        // onFilterChange({}) // Pozovi sa praznim opcijama ako reset dugme poziva filterChange
    };


    return (
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-50 rounded-md">
            {/* Polje za pretragu */}
            <div className="flex-1 w-full sm:w-auto">
                 {/* <Label htmlFor="search">Search</Label> */}
                 {/* <Input
                    id="search"
                    placeholder="Search providers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                 /> */}
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
                 {/* <Label htmlFor="isActive">Status</Label> */}
                 {/* <Select value={isActive === null ? 'all' : isActive.toString()} onValueChange={(value) => setIsActive(value === 'all' ? null : value === 'true')}>
                    <SelectTrigger id="isActive" className="w-[180px]">
                        <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                 </Select> */}
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

             {/* Dugme za resetovanje filtera (opciono) */}
             {/* <Button variant="outline" onClick={handleResetFilters}>Reset</Button> */}
             {/* Placeholder */}
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