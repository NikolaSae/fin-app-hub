// components/contracts/ContractsSection.tsx

"use client";

import { useState } from "react";
import { ContractFilters } from "@/components/contracts/ContractFilters";
import { ContractList } from "@/components/contracts/ContractList";
import { Contract } from "@/lib/types/contract-types";

interface ContractsSectionProps {
  initialContracts: Contract[];
  serverTime: string;
}

export function ContractsSection({ initialContracts, serverTime }: ContractsSectionProps) {
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>(initialContracts);

  // Handler for filter changes
  const handleFilterChange = (filtered: Contract[]) => {
    setFilteredContracts(filtered);
  };

  return (
    <>
      <ContractFilters 
        contracts={initialContracts} 
        onFilterChange={handleFilterChange} 
      />
      
      <ContractList 
        contracts={filteredContracts} 
        serverTime={serverTime} 
      />
    </>
  );
}