"use client";

import React from 'react';
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Loader2, Eye, EyeOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SenderBlacklistEntry } from "@/lib/types/blacklist";
import { updateBlacklistEntry } from "@/actions/blacklist/update-blacklist-entry";
import { deleteBlacklistEntry } from "@/actions/blacklist/delete-blacklist-entry";
import { BlacklistPagination } from "@/hooks/use-sender-blacklist";
import EmptyState from "@/components/EmptyState";

interface SenderBlacklistTableProps {
  entries: SenderBlacklistEntry[];
  isLoading: boolean;
  pagination: BlacklistPagination;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  matchedProviders: Record<string, string[]>; // { [senderName]: providerNames[] }
}

export function SenderBlacklistTable({ 
  entries,
  isLoading,
  pagination,
  onPageChange,
  onRefresh,
  matchedProviders = {}
}: SenderBlacklistTableProps) {
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  // Ensure entries isn't undefined
  const safeEntries = entries || [];

  const handlePageChange = (newPage: number) => {
    onPageChange(newPage);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setUpdatingId(id);
    try {
      const result = await updateBlacklistEntry({
        id,
        isActive: !currentStatus
      });

      if (result.success) {
        toast.success(`Blacklist entry ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        onRefresh();
      } else {
        toast.error(result.error || "Failed to update blacklist entry");
      }
    } catch (error) {
      console.error("Error updating blacklist entry:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blacklist entry?")) {
      return;
    }

    setUpdatingId(id);
    try {
      const result = await deleteBlacklistEntry(id);

      if (result.success) {
        toast.success("Blacklist entry deleted successfully");
        onRefresh();
      } else {
        toast.error(result.error || "Failed to delete blacklist entry");
      }
    } catch (error) {
      console.error("Error deleting blacklist entry:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (entry: SenderBlacklistEntry) => {
    if (!entry.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    
    // Check if there's a match for this senderName
    const hasMatch = matchedProviders[entry.senderName] && matchedProviders[entry.senderName].length > 0;
    
    if (hasMatch) {
      return <Badge variant="destructive">Detected</Badge>;
    }
    
    return <Badge variant="outline">Active</Badge>;
  };

  // Render matched providers as a list
  const renderMatchedProviders = (senderName: string) => {
    if (!matchedProviders[senderName] || matchedProviders[senderName].length === 0) {
      return '-';
    }
    
    return (
      <div className="flex flex-col gap-1 max-w-xs">
        {matchedProviders[senderName].map((provider, index) => (
          <Badge 
            key={index} 
            variant="destructive" 
            className="w-fit truncate"
            title={provider}
          >
            {provider}
          </Badge>
        ))}
      </div>
    );
  };

  if (isLoading && safeEntries.length === 0) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalPages = pagination.totalPages || 0;

  return (
    <div className="space-y-4">
      {!isLoading && safeEntries.length === 0 ? (
        <EmptyState
          title="No Blacklist Entries Found"
          description="No sender names are currently blacklisted for the selected criteria."
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sender Name</TableHead>
                <TableHead className="min-w-[150px]">Matched Providers</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Match</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {safeEntries.map(entry => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.senderName}</TableCell>
                  <TableCell>
                    {renderMatchedProviders(entry.senderName)}
                  </TableCell>
                  <TableCell>
                    {entry.effectiveDate 
                      ? format(new Date(entry.effectiveDate), "PPP")
                      : '-'
                    }
                  </TableCell>
                  <TableCell>{getStatusBadge(entry)}</TableCell>
                  <TableCell>
                    {entry.lastMatchDate 
                      ? format(new Date(entry.lastMatchDate), "PPP p")
                      : '-'
                    }
                  </TableCell>
                  <TableCell>{entry.description || '-'}</TableCell>
                  <TableCell>{entry.createdBy?.name || 'Unknown User'}</TableCell>
                  <TableCell>
                    {entry.createdAt 
                      ? format(new Date(entry.createdAt), "PPP")
                      : '-'
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(entry.id, entry.isActive)}
                        disabled={updatingId === entry.id}
                      >
                        {updatingId === entry.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : entry.isActive ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
                        disabled={updatingId === entry.id}
                      >
                        {updatingId === entry.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1 || isLoading || !!updatingId}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
              const pageNum = index + 1;
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => handlePageChange(pageNum)}
                    isActive={pageNum === pagination.page}
                    disabled={isLoading || !!updatingId}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(Math.min(totalPages, pagination.page + 1))}
                disabled={pagination.page >= totalPages || isLoading || !!updatingId}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}