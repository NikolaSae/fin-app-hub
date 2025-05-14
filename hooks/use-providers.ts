// hooks/use-providers.ts
"use client";
import { useState, useEffect, useCallback } from "react";
import { ProviderWithCounts, ProviderFilterOptions } from "@/lib/types/provider-types";
import { getProviders } from "@/actions/providers/get";

interface PaginationOptions {
  page: number;
  limit: number;
}

export function useProviders(
  initialFilters: ProviderFilterOptions = {},
  initialPagination: PaginationOptions = { page: 1, limit: 10 }
) {
  const [filters, setFilters] = useState<ProviderFilterOptions>(initialFilters);
  const [pagination, setPagination] = useState<PaginationOptions>(initialPagination);
  const [providers, setProviders] = useState<ProviderWithCounts[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getProviders({ ...filters, ...pagination });
      if (result.error) throw new Error(result.error);
      setProviders(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch providers");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const updateFilters = useCallback((newFilters: ProviderFilterOptions) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const updatePagination = useCallback((newPagination: Partial<PaginationOptions>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  return {
    providers,
    total,
    loading,
    error,
    filters,
    pagination,
    setFilters: updateFilters,
    setPagination: updatePagination,
    refresh: fetchProviders
  };
}