///app/(protected)/contracts/[id]/edit/page.tsx

import { ContractForm } from "@/components/contracts/ContractForm";
import { notFound } from "next/navigation";
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
    title: `Edit ${contract.name} | Contract Management`,
    description: `Edit details for contract ${contract.contractNumber}`,
  };
}

interface EditContractPageProps {
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
    },
  });

  if (!contract) {
    notFound();
  }

  return contract;
}

export default async function EditContractPage({ params }: EditContractPageProps) {
  const contract = await getContract(params.id);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Contract</h1>
        <p className="text-gray-500">
          Update details for contract #{contract.contractNumber}
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <ContractForm contract={contract} isEditing={true} />
      </div>
    </div>
  );
}