// /app/(protected)/contracts/page.tsx
import { Suspense } from "react";
import { ContractList } from "@/components/contracts/ContractList";
import { ContractFilters } from "@/components/contracts/ContractFilters";
import { Metadata } from "next";
import { Contract } from '@/lib/types/contract-types'; // Uvoz tipa Ugovora
import { db } from '@/lib/db'; // Uvoz Prisma klijenta

export const metadata: Metadata = {
  title: "Contracts | Management Dashboard",
  description: "View and manage all contracts",
};

// Funkcija za dohvatanje inicijalnih ugovora i vremena servera
async function getInitialContractsData(): Promise<{ contracts: Contract[], serverTime: string }> {
  try {
    // Dohvatanje ugovora direktno iz baze koristeći Prisma
    const contracts = await db.contract.findMany({
       orderBy: { createdAt: 'desc' }, // Podrazumevano sortiranje
       include: {
         // Uključite relacije potrebne za prikaz na listi (kako je definisano u useContracts hooku)
         provider: { select: { id: true, name: true } },
         humanitarianOrg: { select: { id: true, name: true } },
         parkingService: { select: { id: true, name: true } },
          _count: {
              select: { services: true, attachments: true, reminders: true }
          }
       },
        // Opciono: Dodajte default filtere ako ih ima za glavnu listu
    });

    // Dohvatanje trenutnog vremena servera
    const serverTime = new Date().toISOString();

    // Vraćamo objekat sa ugovorima i vremenom servera
    return { contracts: contracts as Contract[], serverTime };

  } catch (error) {
    console.error("Error fetching initial contracts data from DB:", error);
    // Vraćamo prazan niz i trenutno vreme (ili null) u slučaju greške
     const serverTime = new Date().toISOString(); // Ipak vratimo vreme da ne bi bilo undefined
    return { contracts: [], serverTime }; // Ili null za serverTime ako želite jasnije označiti grešku
  }
}


// Glavna Server Komponenta za stranicu sa ugovorima
export default async function ContractsPage() { // Ostaje async
  // Dohvatanje podataka i vremena servera PRE rendovanja klijentske komponente
  const initialData = await getInitialContractsData();


  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contracts</h1>
          <p className="text-gray-500">
            View and manage all contracts in the system
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/contracts/new"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
          >
            Create Contract
          </a>
        </div>
      </div>

      <ContractFilters />

      <Suspense fallback={<div>Loading contracts...</div>}>
        {/* Prosleđujemo dohvataene podatke i vreme servera kao prop */}
        <ContractList contracts={initialData.contracts} serverTime={initialData.serverTime} />
      </Suspense>
    </div>
  );
}