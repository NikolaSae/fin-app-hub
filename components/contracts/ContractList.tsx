// /components/contracts/ContractList.tsx
"use client";

import { useState, useMemo } from "react"; // Dodaj useMemo
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ContractStatusBadge } from "@/components/contracts/ContractStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { ContractFilters } from "@/components/contracts/ContractFilters";
import { formatDate } from "@/lib/utils"; // Pretpostavljena putanja do formatDate
import { ContractType, ContractStatus } from "@prisma/client";
import { getDaysUntilOrSinceExpiration } from '@/lib/contracts/expiration-checker'; // Uvoz utility funkcije

interface Contract {
  id: string;
  name: string;
  contractNumber: string;
  type: ContractType;
  status: ContractStatus;
  startDate: Date;
  endDate: Date;
  revenuePercentage: number;
  provider?: { name: string } | null;
  humanitarianOrg?: { name: string } | null;
  parkingService?: { name: string } | null;
  createdAt: Date;
}

interface ContractListProps {
  contracts: Contract[];
  showFilters?: boolean;
  serverTime: string; // Dodajemo prop za vreme servera
}

export function ContractList({ contracts: initialContracts, showFilters = true, serverTime }: ContractListProps) {
  const router = useRouter();
  // Inicijalizujte state sa praznim nizom ako initialContracts nije definisan (dodatna sigurnost)
  const [contracts, setContracts] = useState<Contract[]>(initialContracts || []);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>(initialContracts || []);
 // Možete sačuvati serverTime u stanju ako je potrebno, ali za kalkulaciju može se koristiti direktno
 // const [currentTime, setCurrentTime] = useState<Date>(new Date(serverTime));

  const handleFilterChange = (filtered: Contract[]) => {
    setFilteredContracts(filtered);
  };

  const getRelatedEntityName = (contract: Contract) => {
    switch (contract.type) {
      case "PROVIDER":
        return contract.provider?.name || "N/A";
      case "HUMANITARIAN":
        return contract.humanitarianOrg?.name || "N/A";
      case "PARKING":
        return contract.parkingService?.name || "N/A";
      default:
        return "N/A";
    }
  };

  // Koristimo useMemo da bi se kalkulacija dana do isteka izvršila samo kada se promeni filteredContracts ili serverTime
  // Ovo koristi utility funkciju koju smo ranije kreirali
  const contractsWithExpiration = useMemo(() => {
      const now = new Date(serverTime); // Koristimo server-vreme za početnu kalkulaciju
      // Za naknadne rendere nakon hidratacije, React će verovatno ponovo pokrenuti render
      // i useMemo će dobiti novu instancu now ako se serverTime ne menja,
      // ali hydration mismatch se dešava samo na PRVOM klijentskom renderu.
      // Za dinamičko ažuriranje "X days left" tokom vremena na klijentu,
      // trebali biste koristiti setInterval ili slično da povremeno ažurirate currentTime state.
      // Ali za rešavanje hydration mismatcha, korišćenje serverTime za inicijalni render je ključno.

      return filteredContracts.map(contract => {
          const daysUntilExpiration = getDaysUntilOrSinceExpiration(new Date(contract.endDate)); // Koristimo utility
           // Možda želite da se isExpiringSoon logike definiše centralno ili da se koristi utility iz expiration-checker.ts
           const isExpiringSoon = daysUntilExpiration <= 30 && daysUntilExpiration > 0; // Ponovo koristimo 30 dana prag

           return {
               ...contract,
               daysUntilExpiration,
               isExpiringSoon,
           };
      });
  }, [filteredContracts, serverTime]); // Ponovi kalkulaciju kada se filteredContracts ili serverTime promene


  return (
    <div className="space-y-4">
      {showFilters && (
        <ContractFilters contracts={contracts} onFilterChange={handleFilterChange} />
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract Number</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Revenue %</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contractsWithExpiration.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                  No contracts found
                </TableCell>
              </TableRow>
            ) : (
              contractsWithExpiration.map((contract) => {
                return (
                  <TableRow
                    key={contract.id}
                    className={contract.isExpiringSoon ? "bg-amber-50" : ""}
                  >
                    <TableCell className="font-medium">
                      <Link
                        href={`/contracts/${contract.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {contract.contractNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{contract.name}</TableCell>
                    <TableCell>{contract.type}</TableCell>
                    <TableCell>{getRelatedEntityName(contract)}</TableCell>
                    <TableCell>{formatDate(contract.startDate)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {formatDate(contract.endDate)}
                        {contract.isExpiringSoon && (
                          <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800">
                            {contract.daysUntilExpiration} days left 
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ContractStatusBadge status={contract.status} />
                    </TableCell>
                    <TableCell>{contract.revenuePercentage}%</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/contracts/${contract.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Uklanjamo originalnu getDaysUntilExpiration funkciju jer koristimo utility
// const getDaysUntilExpiration = (endDate: Date) => {
//     const today = new Date();
//     const end = new Date(endDate);
//     const diffTime = end.getTime() - today.getTime();
//     return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
// };