// /components/contracts/enhanced-contract-list.tsx
"use client";
import { useState } from "react";
import { Contract, ContractRenewalSubStatus } from "@/lib/types/contract-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { MoreHorizontal, AlertTriangle, Calendar, FileText } from "lucide-react";
import { RenewalDialog } from "./renewal-dialog";
import { StatusChangeDialog } from "./status-change-dialog";

interface EnhancedContractListProps {
  contracts: Contract[];
  serverTime: string;
  onContractUpdate?: () => void;
}

// Helper function to check if contract is expiring soon
function isContractExpiringSoon(endDate: string, serverTime: string): boolean {
  const contractEndDate = new Date(endDate);
  const currentDate = new Date(serverTime);
  const diffInMs = contractEndDate.getTime() - currentDate.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  
  // Consider contract expiring soon if it expires within 30 days
  return diffInDays <= 30 && diffInDays > 0;
}

export function EnhancedContractList({ 
  contracts, 
  serverTime,
  onContractUpdate 
}: EnhancedContractListProps) {
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [renewalDialogOpen, setRenewalDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const handleRenewalAction = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    setSelectedContractId(contractId);
    setSelectedContract(contract || null);
    setRenewalDialogOpen(true);
  };

  const handleStatusChange = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    setSelectedContractId(contractId);
    setSelectedContract(contract || null);
    setStatusDialogOpen(true);
  };

  const handleDialogClose = () => {
    setRenewalDialogOpen(false);
    setStatusDialogOpen(false);
    setSelectedContractId(null);
    setSelectedContract(null);
    onContractUpdate?.();
    if (!onContractUpdate) {
      window.location.reload();
    }
  };

  // Status change is now handled directly in the StatusChangeDialog component
  // No need for a separate handler here since the dialog manages its own server action

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
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contract Number</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sub Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Partner</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract) => {
              const isExpiringSoon = isContractExpiringSoon(contract.endDate, serverTime);
              const currentRenewal = contract.renewals?.[0]; // Najnoviji renewal
              
              return (
                <TableRow 
                  key={contract.id} 
                  className={isExpiringSoon ? "bg-orange-50 hover:bg-orange-100" : ""}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Link href={`/contracts/${contract.id}`} className="hover:underline">
                        {contract.name}
                      </Link>
                      {isExpiringSoon && (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{contract.contractNumber}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {contract.type.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge 
                      status={contract.status} 
                      isExpiring={isExpiringSoon}
                    />
                  </TableCell>
                  <TableCell>
                    {contract.status === 'RENEWAL_IN_PROGRESS' && currentRenewal ? (
                      <SubStatusBadge subStatus={currentRenewal.subStatus} />
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(contract.startDate)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {formatDate(contract.endDate)}
                      {isExpiringSoon && (
                        <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-200">
                          Expiring Soon
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {contract.provider?.name || 
                     contract.humanitarianOrg?.name || 
                     contract.parkingService?.name || 
                     "N/A"}
                  </TableCell>
                  <TableCell>
                    <ContractActionsMenu 
                      contract={contract}
                      onRenewalAction={() => handleRenewalAction(contract.id)}
                      onStatusChange={() => handleStatusChange(contract.id)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Renewal Dialog */}
      {selectedContractId && (
        <RenewalDialog
          contractId={selectedContractId}
          open={renewalDialogOpen}
          onClose={handleDialogClose}
        />
      )}

      {/* Status Change Dialog */}
      {selectedContractId && selectedContract && (
        <StatusChangeDialog
          contractId={selectedContractId}
          open={statusDialogOpen}
          onClose={handleDialogClose}
          currentStatus={selectedContract.status}
          contractName={selectedContract.name}
        />
      )}
    </>
  );
}

// Helper component for status badges
function StatusBadge({ 
  status, 
  isExpiring = false 
}: { 
  status: string; 
  isExpiring?: boolean; 
}) {
  const getVariant = (status: string, isExpiring: boolean) => {
    if (isExpiring && status === 'ACTIVE') {
      return "bg-orange-100 text-orange-800 border-orange-200";
    }
    
    const variants: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-800 border-green-200",
      DRAFT: "bg-gray-100 text-gray-800 border-gray-200",
      EXPIRED: "bg-red-100 text-red-800 border-red-200",
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      TERMINATED: "bg-red-100 text-red-800 border-red-200",
      RENEWAL_IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
    };
    
    return variants[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const badgeClass = getVariant(status, isExpiring);
  
  return (
    <Badge className={`font-medium ${badgeClass}`}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}

// Helper component for sub-status badges
function SubStatusBadge({ subStatus }: { subStatus: ContractRenewalSubStatus }) {
  const variants: Record<ContractRenewalSubStatus, string> = {
    DOCUMENT_COLLECTION: "bg-yellow-100 text-yellow-800 border-yellow-200",
    LEGAL_REVIEW: "bg-purple-100 text-purple-800 border-purple-200",
    FINANCIAL_APPROVAL: "bg-blue-100 text-blue-800 border-blue-200",
    AWAITING_SIGNATURE: "bg-indigo-100 text-indigo-800 border-indigo-200",
    FINAL_PROCESSING: "bg-green-100 text-green-800 border-green-200",
    TECHNICAL_REVIEW: "bg-cyan-100 text-cyan-800 border-cyan-200",
    MANAGEMENT_APPROVAL: "bg-pink-100 text-pink-800 border-pink-200",
  };

  const badgeClass = variants[subStatus] || "bg-gray-100 text-gray-800 border-gray-200";
  
  return (
    <Badge className={`font-medium text-xs ${badgeClass}`}>
      {subStatus.replace(/_/g, ' ')}
    </Badge>
  );
}

// Actions menu component
function ContractActionsMenu({ 
  contract, 
  onRenewalAction, 
  onStatusChange 
}: {
  contract: Contract;
  onRenewalAction: () => void;
  onStatusChange: () => void;
}) {
  const canStartRenewal = contract.status === 'ACTIVE' || contract.status === 'PENDING';
  const hasActiveRenewal = contract.status === 'RENEWAL_IN_PROGRESS';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/contracts/${contract.id}`}>
            <FileText className="mr-2 h-4 w-4" />
            View Details
          </Link>
        </DropdownMenuItem>
        
        {canStartRenewal && (
          <DropdownMenuItem onClick={onRenewalAction}>
            <Calendar className="mr-2 h-4 w-4" />
            Start Renewal
          </DropdownMenuItem>
        )}
        
        {hasActiveRenewal && (
          <DropdownMenuItem onClick={onRenewalAction}>
            <Calendar className="mr-2 h-4 w-4" />
            Manage Renewal
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={onStatusChange}>
          <AlertTriangle className="mr-2 h-4 w-4" />
          Change Status
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}