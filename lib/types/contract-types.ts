// /lib/types/contract-types.ts

import { ContractStatus, ContractType, Provider, HumanitarianOrg, ParkingService, ServiceContract, ContractAttachment, ContractReminder, User, Service } from '@prisma/client'; // Uvoz svih relevantnih Prisma modela i enuma
import { z } from 'zod';
import { contractSchema } from '@/schemas/contract'; // Uvoz Zod šeme za ugovor koju smo ranije kreirali

// Tip za podatke forme/unosa ugovora (izveden iz Zod šeme)
// Ovo odgovara tipu koji ste već koristili u ContractForm i akcijama
export type ContractFormData = z.infer<typeof contractSchema>;

// Tip za podatke ugovora sa relacijama, kako se obično dohvaća sa backend-a
// Kreiramo tip koji uključuje najčešće korišćene relacije na frontend-u
export interface Contract {
  id: string;
  name: string;
  contractNumber: string;
  type: ContractType;
  status: ContractStatus;
  startDate: Date; // Biće Date objekat nakon parsiranja sa backend-a
  endDate: Date;   // Biće Date objekat nakon parsiranja sa backend-a
  revenuePercentage: number;
  description: string | null;

  // Uključene relacije (mogu biti null ako nisu eksplicitno učitane ili nisu relevantne za tip ugovora)
  provider?: Provider | null;
  humanitarianOrg?: HumanitarianOrg | null;
  parkingService?: ParkingService | null;

  // Relacije koje su nizovi - koristite Prisma generisane tipove ili ih definišite detaljnije ako je potrebno
  // Ove bi bile prisutne ako se učitaju sa 'include'
  services?: (ServiceContract & { service: Service })[]; // Link Servisa sa detaljima Servisa
  attachments?: ContractAttachment[];
  reminders?: ContractReminder[];
  humanitarianRenewals?: any[]; // Zameniti 'any' odgovarajućim tipom ako se koristi

  // Audit polja sa uključenim korisnicima
  createdBy?: { id: string; name: string | null; } | null;
  lastModifiedBy?: { id: string; name: string | null; } | null;

  // Polja za count relacija (_count)
   _count?: {
     services: number;
     attachments: number;
     reminders: number;
      humanitarianRenewals: number;
   };

  // Vremenske oznake
  createdAt: Date;
  updatedAt: Date;
}


// Interfejs za opcije filtriranja ugovora (koristi se u hookovima i API rutama)
export interface FilterOptions {
  type?: ContractType | null;
  status?: ContractStatus | null;
  providerId?: string | null;
  humanitarianOrgId?: string | null;
  parkingServiceId?: string | null;
  search?: string | null;
  expiringWithin?: number | null; // Broj dana do isteka
  limit?: number; // Za paginaciju ili ograničenje broja rezultata
  // Dodajte druga polja za filtriranje ako je potrebno (npr. datumski opsezi)
}

// Tipovi za status ugovora (možda se može premestiti u contract-status.ts)
// export type ContractStatusType = 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'RENEWAL_IN_PROGRESS';