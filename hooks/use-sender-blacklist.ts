// hooks/use-sender-blacklist.ts
import { useState, useEffect, useCallback } from "react";
import { SenderBlacklistWithProvider } from "@/lib/types/blacklist";

export interface BlacklistPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function useSenderBlacklist() {
  const [entries, setEntries] = useState<SenderBlacklistWithProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<BlacklistPagination>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });
  const [search, setSearch] = useState("");
  const [providerId, setProviderId] = useState("");

  const fetchBlacklist = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pagination.pageSize.toString(),
        ...(search && { search }),
        ...(providerId && { providerId }),
      });

      const response = await fetch(`/api/sender-blacklist?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch blacklist: ${response.statusText}`);
      }

      const data = await response.json();
      
      setEntries(data.entries);
      setPagination({
        page: data.pagination.page,
        pageSize: data.pagination.pageSize,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      });
    } catch (err) {
      console.error("Fetch blacklist error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageSize, search, providerId]);

  useEffect(() => {
    fetchBlacklist();
  }, [fetchBlacklist]);

  return {
    entries,
    isLoading,
    error,
    pagination,
    search,
    setSearch,
    providerId,
    setProviderId,
    fetchBlacklist,
  };
}