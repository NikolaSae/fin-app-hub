///app/(protected)/contracts/page.tsx

import { Suspense } from "react";
import { ContractsSection } from "@/components/contracts/ContractsSection";
import { Metadata } from "next";
import { Contract } from '@/lib/types/contract-types';
import { db } from '@/lib/db';

export const metadata: Metadata = {
  title: "Contracts | Management Dashboard",
  description: "View and manage all contracts",
};

// Function to fetch initial contracts data
async function getInitialContractsData(): Promise<{ contracts: Contract[], serverTime: string }> {
  try {
    const contracts = await db.contract.findMany({
       orderBy: { createdAt: 'desc' },
       include: {
         provider: { select: { id: true, name: true } },
         humanitarianOrg: { select: { id: true, name: true } },
         parkingService: { select: { id: true, name: true } },
         _count: {
           select: { services: true, attachments: true, reminders: true }
         }
       },
    });

    const serverTime = new Date().toISOString();
    return { contracts: contracts as Contract[], serverTime };
  } catch (error) {
    console.error("Error fetching initial contracts data from DB:", error);
    const serverTime = new Date().toISOString();
    return { contracts: [], serverTime };
  }
}

export default async function ContractsPage() {
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
          {/* Add Expiring Contracts Button Here */}
          <a
            href="/contracts/expiring"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
          >
            Expiring Contracts
          </a>
          
          <a
            href="/contracts/new"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
          >
            Create Contract
          </a>
        </div>
      </div>

      <Suspense fallback={<div>Loading contracts...</div>}>
        <ContractsSection 
          initialContracts={initialData.contracts} 
          serverTime={initialData.serverTime} 
        />
      </Suspense>
    </div>
  );
}