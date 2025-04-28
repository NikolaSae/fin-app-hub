// /components/contracts/ContractList.tsx
"use client";

import { useState } from "react";
import { Contract } from "@/lib/types/contract-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface ContractListProps {
  contracts: Contract[];
  serverTime: string;
}

export function ContractList({ contracts, serverTime }: ContractListProps) {
  // When no contracts are available
  if (!contracts || contracts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/50 rounded-md">
        <h3 className="text-lg font-medium">No contracts found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Create a new contract or adjust your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contract Number</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Partner</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract) => (
            <TableRow key={contract.id}>
              <TableCell className="font-medium">
                <Link href={`/contracts/${contract.id}`} className="hover:underline">
                  {contract.name}
                </Link>
              </TableCell>
              <TableCell>{contract.contractNumber}</TableCell>
              <TableCell>{contract.type.replace(/_/g, ' ')}</TableCell>
              <TableCell>
                <StatusBadge status={contract.status} />
              </TableCell>
              <TableCell>{formatDate(contract.startDate)}</TableCell>
              <TableCell>{formatDate(contract.endDate)}</TableCell>
              <TableCell>
                {contract.provider?.name || 
                 contract.humanitarianOrg?.name || 
                 contract.parkingService?.name || 
                 "N/A"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Helper component for status badges
function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800 border-green-200",
    DRAFT: "bg-gray-100 text-gray-800 border-gray-200",
    EXPIRED: "bg-red-100 text-red-800 border-red-200",
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    TERMINATED: "bg-red-100 text-red-800 border-red-200",
  };

  const badgeClass = variants[status] || "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <Badge className={`font-medium ${badgeClass}`}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}