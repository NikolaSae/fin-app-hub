///app/(protected)/contracts/new/page.tsx

import { ContractForm } from "@/components/contracts/ContractForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create New Contract | Management Dashboard",
  description: "Create a new contract in the system",
};

export default function NewContractPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create New Contract</h1>
        <p className="text-gray-500">
          Create a new contract in the system
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <ContractForm />
      </div>
    </div>
  );
}