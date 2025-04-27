// /lib/types/provider-types.ts

import { Provider } from '@prisma/client'; // Uvoz osnovnog Prisma tipa
import { z } from 'zod';
// Importujemo Zod šemu da bismo izveli tip forme
import { providerSchema } from '@/schemas/provider'; // Kreirali smo ovaj fajl

// Tip za podatke forme za kreiranje/ažuriranje provajdera (izveden iz Zod šeme)
export type ProviderFormData = z.infer<typeof providerSchema>;


// Tip za Provider model sa uključenim relacijama koje se često koriste (npr. u listama ili detaljima)
// Ovo je proširenje osnovnog Prisma tipa
export interface ProviderWithCounts extends Provider {
    _count?: {
        contracts: number;
        vasServices: number;
        bulkServices: number;
        complaints: number;
    };
    // Dodajte druge include relacije ovde ako se često koriste (npr. liste povezanih ugovora na detaljnoj stranici)
    // contracts?: Contract[]; // Potreban uvoz tipa Contract
    // complaints?: Complaint[]; // Potreban uvoz tipa Complaint
    // ...
}

// Interfejs za opcije filtriranja provajdera (koristi se u hooku i API ruti)
export interface ProviderFilterOptions {
    search?: string | null; // Pretraga po imenu, kontaktu, emailu, itd.
    isActive?: boolean | null; // Filter po statusu aktivnost (true, false, null za sve)
    // Dodajte ostala polja za filtere ako su potrebna
}


// Interfejs za podatke koji se vraćaju sa API rute /api/providers
export interface ProvidersApiResponse {
    providers: ProviderWithCounts[];
    totalCount: number;
}