// /hooks/use-humanitarian-orgs.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  HumanitarianOrgWithDetails,
  HumanitarianOrgFilterOptions
} from "@/lib/types/humanitarian-org-types";
import { getHumanitarianOrgs } from "@/actions/humanitarian-orgs/get";

interface PaginationOptions {
  page: number;
  limit: number;
}

export function useHumanitarianOrgs(
  initialFilters: HumanitarianOrgFilterOptions = {},
  initialPagination: PaginationOptions = { page: 1, limit: 10 }
) {
  const [filters, setFilters] = useState<HumanitarianOrgFilterOptions>(initialFilters);
  const [pagination, setPagination] = useState<PaginationOptions>(initialPagination);
  const [humanitarianOrgs, setHumanitarianOrgs] = useState<HumanitarianOrgWithDetails[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrgs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getHumanitarianOrgs({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });

      setHumanitarianOrgs(result.data);
      setTotalCount(result.total);
    } catch (err) {
      console.error("Error fetching humanitarian organizations:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch humanitarian organizations"));
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  const updateFilters = useCallback((newFilters: HumanitarianOrgFilterOptions) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const updatePagination = useCallback((newPagination: Partial<PaginationOptions>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  return {
    humanitarianOrgs,
    totalCount,
    loading,
    error,
    filters,
    pagination,
    setFilters: updateFilters,
    setPagination: updatePagination,
    refresh: fetchOrgs
  };
}