///components/contracts/ContractFilters.tsx


"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContractType, ContractStatus } from "@prisma/client"; // Uvezeno iz Prisma klijenta

interface Contract {
  id: string;
  name: string;
  contractNumber: string;
  type: ContractType;
  status: ContractStatus;
  startDate: Date;
  endDate: Date;
  revenuePercentage: number;
  provider?: { id: string; name: string } | null;
  humanitarianOrg?: { id: string; name: string } | null;
  parkingService?: { id: string; name: string } | null;
  createdAt: Date;
}

interface ContractFiltersProps {
  // ISPRAVLJENO: Prihvatamo contracts prop koji može biti undefined ili null
  contracts: Contract[] | undefined | null;
  onFilterChange: (filtered: Contract[]) => void;
}

export function ContractFilters({ contracts, onFilterChange }: ContractFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [expiringSoon, setExpiringSoon] = useState<boolean>(false);

  useEffect(() => {
    // ISPRAVLJENO: Koristimo siguran pristup contracts propu
    const contractsToFilter = Array.isArray(contracts) ? contracts : [];
    let filtered = [...contractsToFilter]; // Sada je sigurno koristiti spread operator

    // Filter by search term (contract name or number)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        contract =>
          contract.name.toLowerCase().includes(term) ||
          contract.contractNumber.toLowerCase().includes(term)
      );
    }

    // Filter by contract type
    if (selectedType) {
      filtered = filtered.filter(contract => contract.type === selectedType);
    }

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter(contract => contract.status === selectedStatus);
    }

    // Filter by expiring soon (next 30 days)
    if (expiringSoon) {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      filtered = filtered.filter(contract => {
        // ISPRAVLJENO: Proveravamo da li je endDate validan datum
        const endDate = new Date(contract.endDate);
        return !isNaN(endDate.getTime()) && endDate > today && endDate <= thirtyDaysFromNow;
      });
    }

    // Pozivamo onFilterChange sa filtriranim rezultatima
    onFilterChange(filtered);

    // ISPRAVLJENO: Dodajemo 'contracts' u dependency array
  }, [searchTerm, selectedType, selectedStatus, expiringSoon, contracts, onFilterChange]); // Dodat onFilterChange

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedType("");
    setSelectedStatus("");
    setExpiringSoon(false);
    // onFilterChange se poziva automatski zbog useEffect kada se stanja promene
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="Search by name or number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <Select
              value={selectedType}
              onValueChange={setSelectedType}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {/* Prikazujemo opcije iz ContractType enum-a */}
                {Object.values(ContractType).map(type => (
                  <SelectItem key={type} value={type}>{type.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                {/* Prikazujemo opcije iz ContractStatus enum-a */}
                {Object.values(ContractStatus).map(status => (
                  <SelectItem key={status} value={status}>{status.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            {/* ISPRAVLJENO: Koristimo Checkbox komponentu iz shadcn/ui */}
            {/* Uvezite Checkbox: import { Checkbox } from "@/components/ui/checkbox"; */}
            <input
              type="checkbox"
              id="expiringSoon"
              checked={expiringSoon}
              onChange={(e) => setExpiringSoon(e.target.checked)}
              className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="expiringSoon" className="text-sm">Expiring within 30 days</label>

            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={resetFilters}
            >
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
