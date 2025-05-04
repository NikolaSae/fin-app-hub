// components/contracts/ContractsSection.tsx
"use client";

import { useState, useCallback } from "react";
import { ContractFilters } from "@/components/contracts/ContractFilters";
import { ContractList } from "@/components/contracts/ContractList";
import { Contract } from "@/lib/types/contract-types";

interface ContractsSectionProps {
  initialContracts: Contract[];
  serverTime: string;
}

export function ContractsSection({ initialContracts, serverTime }: ContractsSectionProps) {
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>(initialContracts);
  
  // Use useCallback to prevent recreation of this function on every render
  const handleFilterChange = useCallback((filtered: Contract[]) => {
    setFilteredContracts(filtered);
  }, []);
  
  return (
    <>
      <ContractFilters 
        contracts={initialContracts} 
        onFilterChange={handleFilterChange}
        serverTime={serverTime}
      />
      
      <ContractList 
        contracts={filteredContracts} 
        serverTime={serverTime} 
      />
    </>
  );
}