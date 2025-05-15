// hooks/use-providers.ts
"use client";

import { useState, useEffect } from "react";

export interface Provider {
  id: string;
  name: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  isActive: boolean;
  _count?: {
    contracts?: number;
    complaints?: number;
    vasServices?: number;
    bulkServices?: number;
  };
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface FilterOptions {
  search?: string;
  isActive?: boolean;
  hasContracts?: boolean;
  hasComplaints?: boolean;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export function useProviders(
  initialFilters: FilterOptions = {}, 
  initialPagination: PaginationOptions = { page: 1, limit: 12 }
) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationOptions>(initialPagination);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);

  const fetchProviders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Конвертовање филтера у URL параметре
      const params = new URLSearchParams();
      
      // Додавање параметара за пагинацију
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());
      
      // Додавање филтера
      if (filters.search) {
        params.append("search", filters.search);
      }
      
      if (filters.isActive !== undefined) {
        params.append("isActive", filters.isActive.toString());
      }
      
      if (filters.hasContracts) {
        params.append("hasContracts", "true");
      }
      
      if (filters.hasComplaints) {
        params.append("hasComplaints", "true");
      }
      
      if (filters.sortBy) {
        params.append("sortBy", filters.sortBy);
        params.append("sortDirection", filters.sortDirection || "asc");
      }
      
      // Позив API-ја
      const response = await fetch(`/api/providers?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching providers: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setProviders(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error("Failed to fetch providers:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch providers");
    } finally {
      setLoading(false);
    }
  };

  // Преузимање података када се компонента монтира или када се промене филтери/пагинација
  useEffect(() => {
    fetchProviders();
  }, [pagination.page, pagination.limit, filters]);

  return {
    providers,
    total,
    loading,
    error,
    pagination,
    filters,
    setPagination,
    setFilters,
    refreshData: fetchProviders
  };
}