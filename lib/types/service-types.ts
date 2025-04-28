// /lib/types/service-types.ts

// Uvozimo Service model i ServiceType enum iz Prisma klijenta
import { Service, ServiceType as PrismaServiceType } from '@prisma/client';

// Koristimo ServiceType enum direktno iz Prisma klijenta
export const ServiceType = PrismaServiceType;

// Tip koji proširuje Prisma Service model ako je potrebno dodati polja koja nisu u bazi
// Npr., ako dohvatate _count relacija (koje jesu u bazi, ali se selektuju posebno)
export interface ServiceWithDetails extends Service {
    _count?: {
         // Brojači za relacije koje postoje u vašoj schema.prisma Service modelu
         contracts?: number; // Relacija ServiceContract[]
         vasServices?: number; // Relacija VasService[]
         bulkServices?: number; // Relacija BulkService[]
         complaints?: number; // Relacija Complaint[]
         // Relacija 'products' NE postoji direktno na Service modelu u vašoj šemi
    };
    // Primer: ako fetchujete relacije direktno, a ne samo brojače
    // contracts?: ServiceContract[]; // Importujte ServiceContract
    // vasServices?: VasService[]; // Importujte VasService
    // bulkServices?: BulkService[]; // Importujte BulkService
    // complaints?: Complaint[]; // Importujte Complaint
}


// Tip za opcije filtera za servise
// Usklađen sa poljima u vašoj schema.prisma Service modelu i query parametrima
export interface ServiceFilterOptions {
    search?: string; // Pretraga po imenu, opisu, itd. (pokriva name i description)
    type?: ServiceType; // Filtriranje po tipu servisa (koristimo ServiceType iz Prisma)
    isActive?: boolean; // Filtriranje po statusu aktivnost
    // Dodajte druge opcije filtera ako se pojave nova polja u Service modelu
}

// Tip za odgovor API rute koja vraća listu servisa sa totalCount za paginaciju
export interface ServicesApiResponse {
    services: ServiceWithDetails[];
    totalCount: number;
}

// ServiceFormData se importuje direktno iz schemas/service.ts
// export type ServiceFormData = z.infer<typeof serviceSchema>;