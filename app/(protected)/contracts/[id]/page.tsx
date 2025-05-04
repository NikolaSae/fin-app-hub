///app/(protected)/contracts/[id]/page.tsx

import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ContractDetails } from "@/components/contracts/ContractDetails";
import { ContractStatusBadge } from "@/components/contracts/ContractStatusBadge";
import { AttachmentList } from "@/components/contracts/AttachmentList";
import { ExpiryWarning } from "@/components/contracts/ExpiryWarning";
import { Metadata } from "next";
import { db } from "@/lib/db";
import { calculateContractRevenue } from "@/lib/contracts/revenue-calculator";
// FIX: Import the RevenueBreakdown component
import { RevenueBreakdown } from "@/components/contracts/RevenueBreakdown";


export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const awaitedParams = await params;
  const contract = await db.contract.findUnique({
    where: { id: awaitedParams.id },
  });

  if (!contract) {
    return {
      title: "Contract Not Found",
      description: "The requested contract could not be found",
    };
  }

  return {
    title: `${contract.name} | Contract Details`,
    description: `View details for contract ${contract.contractNumber}`,
  };
}

interface ContractPageProps {
  params: {
    id: string;
  };
}

async function getContract(id: string) {
  const contract = await db.contract.findUnique({
    where: { id },
    include: {
      provider: true,
      humanitarianOrg: true,
      parkingService: true,
      services: {
        include: {
          service: true,
           // You might need to include VASService/BulkService here if
           // your calculateContractRevenue function needed them directly from contract include
           // But the current implementation fetches them separately based on serviceLink & providerId
        },
      },
      attachments: {
        include: {
          uploadedBy: true,
        },
      },
      createdBy: true,
      lastModifiedBy: true,
      reminders: true,
    },
  });

  if (!contract) {
    notFound();
  }

  return contract;
}


export default async function ContractPage({ params }: ContractPageProps) {
  const awaitedParams = await params;
  const contract = await getContract(awaitedParams.id);

  // Fetch the calculated revenue data for the contract
  // calculateContractRevenue uses contract start/end dates by default if none are provided.
  const contractRevenueData = await calculateContractRevenue(contract.id);


  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{contract.name}</h1>
            <ContractStatusBadge status={contract.status} />
          </div>
          <p className="text-gray-500">
            Contract #{contract.contractNumber}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={`/contracts/${contract.id}/edit`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-secondary text-secondary-foreground hover:bg-secondary/90 h-10 py-2 px-4"
          >
            Edit Contract
          </a>
        </div>
      </div>

      {contract.status === "ACTIVE" && (
        <Suspense fallback={<div>Checking expiry...</div>}>
          <ExpiryWarning contractId={contract.id} endDate={contract.endDate} />
        </Suspense>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow">
             {/* Pass the fetched/calculated revenue data */}
            <RevenueBreakdown
                contractId={contract.id}
                contractType={contract.type}
                revenuePercentage={contract.revenuePercentage}
                // Pass the fetched data. It will be null if the calculator returned null/error.
                // The RevenueBreakdown component handles the null/undefined case.
                revenueData={contractRevenueData || undefined}
            />
            {/* ContractDetails might display other static details. Keep it if needed. */}
            <Suspense fallback={<div>Loading contract details...</div>}>
               <ContractDetails contract={contract} />
            </Suspense>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-4">Attachments</h2>
            <Suspense fallback={<div>Loading attachments...</div>}>
              <AttachmentList contractId={contract.id} attachments={contract.attachments} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}