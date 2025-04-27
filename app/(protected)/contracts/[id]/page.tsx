///app/(protected)/contracts/[id]/page.tsx

import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ContractDetails } from "@/components/contracts/ContractDetails";
import { ContractStatusBadge } from "@/components/contracts/ContractStatusBadge";
import { AttachmentList } from "@/components/contracts/AttachmentList";
import { ExpiryWarning } from "@/components/contracts/ExpiryWarning";
import { Metadata } from "next";
import { prisma } from "@/lib/db";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const contract = await prisma.contract.findUnique({
    where: { id: params.id },
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
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      provider: true,
      humanitarianOrg: true,
      parkingService: true,
      services: {
        include: {
          service: true,
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
  const contract = await getContract(params.id);

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
            href={`/contracts/${params.id}/edit`} 
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