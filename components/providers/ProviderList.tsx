//components/providers/ProviderList.tsx

"use client";

import { useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ProviderCard } from "@/components/providers/ProviderCard";
import { ProviderFilters } from "@/components/providers/ProviderFilters";
import { useProviders } from "@/hooks/use-providers";
import { toast } from "sonner";
import ProviderLogList from "@/components/providers/ProviderLogList";


export function ProviderList() {
  const {
    providers,
    total,
    pagination,
    loading,
    error,
    setPagination,
    filters,
    setFilters,
    refreshData
  } = useProviders();

  const [actionLoading, setActionLoading] = useState(false);
  const [logRefreshKey, setLogRefreshKey] = useState(0);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (newFilters) => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setFilters(newFilters);
  };

  const handleStatusChange = async (id: string, isActive: boolean) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/providers/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.statusText}`);
      }

      toast.success(`Provider ${isActive ? 'activated' : 'deactivated'} successfully`);
      refreshData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update provider status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenewContract = async (id: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/providers/${id}/renew-contract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Failed to renew contract: ${response.statusText}`);
      }

      toast.success("Contract renewed successfully");
      refreshData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to renew contract");
    } finally {
      setActionLoading(false);
    }
  };

  const triggerLogRefresh = () => {
      console.log("Triggering log refresh...");
      setLogRefreshKey(prevKey => prevKey + 1);
  };


  if (loading && providers.length === 0) {
    return <div className="text-center py-4">Loading providers...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <ProviderFilters
        initialFilters={filters}
        onFilterChange={handleFilterChange}
      />

      {providers.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-md border">
          <p className="text-gray-500">No providers found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {providers.map(provider => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onStatusChange={handleStatusChange}
              onRenewContract={handleRenewContract}
              triggerLogRefresh={triggerLogRefresh}
            />
          ))}
        </div>
      )}

      {total > pagination.limit && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1 || loading || actionLoading}
              />
            </PaginationItem>
            {Array.from({ length: Math.ceil(total / pagination.limit) }).map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  onClick={() => handlePageChange(index + 1)}
                  isActive={index + 1 === pagination.page}
                  disabled={loading || actionLoading}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(Math.min(Math.ceil(total / pagination.limit), pagination.page + 1))}
                disabled={pagination.page >= Math.ceil(total / pagination.limit) || loading || actionLoading}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <div className="mt-8">
          <ProviderLogList logRefreshKey={logRefreshKey} />
      </div>

    </div>
  );
}