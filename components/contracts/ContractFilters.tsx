// /components/contracts/ContractFilters.tsx
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
import { ContractType, ContractStatus } from "@prisma/client";


interface Contract {
  id: string;
  name: string;
  contractNumber: string;
  type: ContractType;
  status: ContractStatus;

  startDate: Date; // Assuming Date objects or strings parseable by new Date()
  endDate: Date;   // Assuming Date objects or strings parseable by new Date()

  revenuePercentage: number;
  provider?: { id: string; name: string } | null;
  humanitarianOrg?: { id: string; name: string } | null;
  parkingService?: { id: string; name: string } | null;
  createdAt: Date;
}


interface ContractFiltersProps {
  contracts: Contract[] | undefined | null;
  onFilterChange: (filtered: Contract[]) => void;

  serverTime: string; // Prop received from the server-rendered parent
}

export function ContractFilters({ contracts, onFilterChange, serverTime }: ContractFiltersProps) {

}

export function ContractFilters({ contracts, onFilterChange }: ContractFiltersProps) {

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [expiringSoon, setExpiringSoon] = useState<boolean>(false);


   const serverDate = new Date(serverTime);



  useEffect(() => {
    const contractsToFilter = Array.isArray(contracts) ? contracts : [];
    let filtered = [...contractsToFilter];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        contract =>
          contract.name.toLowerCase().includes(term) ||
          contract.contractNumber.toLowerCase().includes(term)
      );
    }


    if (selectedType && selectedType !== "all") { // Handle "all" value
      filtered = filtered.filter(contract => contract.type === selectedType);
    }

    if (selectedStatus && selectedStatus !== "all") { // Handle "all" value

    if (selectedType) {
      filtered = filtered.filter(contract => contract.type === selectedType);
    }

    if (selectedStatus) {

      filtered = filtered.filter(contract => contract.status === selectedStatus);
    }

    if (expiringSoon) {

      const today = serverDate; // Use server date as 'today'
      const thirtyDaysFromNow = new Date(serverDate); // Clone server date

      const today = new Date();
      const thirtyDaysFromNow = new Date();

      thirtyDaysFromNow.setDate(today.getDate() + 30);

      filtered = filtered.filter(contract => {
        const endDate = new Date(contract.endDate);

        return !isNaN(endDate.getTime()) && endDate > today && endDate <= thirtyDaysFromNow;
      });
    }

    onFilterChange(filtered);

  }, [searchTerm, selectedType, selectedStatus, expiringSoon, contracts, onFilterChange, serverDate]);


  }, [searchTerm, selectedType, selectedStatus, expiringSoon, contracts, onFilterChange]);


  const resetFilters = () => {
    setSearchTerm("");
    setSelectedType("");
    setSelectedStatus("");
    setExpiringSoon(false);

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

                <SelectItem value="all">All Types</SelectItem>

                <SelectItem value="all">All Types</SelectItem>

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

                <SelectItem value="all">All Statuses</SelectItem>
}

                {Object.values(ContractStatus).map(status => (
                  <SelectItem key={status} value={status}>{status.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">

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