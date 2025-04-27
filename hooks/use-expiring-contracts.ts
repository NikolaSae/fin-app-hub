///hooks/use-expiring-contracts.ts

"use client";

import { useState, useEffect } from "react";
import { Contract, ContractStatus } from "@prisma/client";

export interface ExpiringContractWithDetails extends Contract {
  provider?: { name: string } | null;
  humanitarianOrg?: { name: string } | null;
  parkingService?: { name: string } | null;
  _count: {
    reminders: number;
  };
}

export interface UseExpiringContractsOptions {
  days?: number;
  refreshInterval?: number; // in milliseconds
  status?: ContractStatus;
}

export function useExpiringContracts(options: UseExpiringContractsOptions = {}) {
  const { 
    days = 30,
    refreshInterval = 0, // 0 means no auto-refresh
    status = "ACTIVE"
  } = options;
  
  const [contracts, setContracts] = useState<ExpiringContractWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExpiringContracts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/contracts/expiring?days=${days}&status=${status}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching expiring contracts: ${response.statusText}`);
      }
      
      const data = await response.json();
      setContracts(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching expiring contracts:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiringContracts();
    
    // Set up refresh interval if specified
    if (refreshInterval > 0) {
      const intervalId = setInterval(() => {
        fetchExpiringContracts();
      }, refreshInterval);
      
      return () => clearInterval(intervalId);
    }
  }, [days, status, refreshInterval]);

  const refresh = () => {
    fetchExpiringContracts();
  };

  // Utility to group contracts by expiration timeframe
  const groupedByExpiryTimeframe = () => {
    const now = new Date();
    const sevenDays = new Date();
    sevenDays.setDate(sevenDays.getDate() + 7);
    const fourteenDays = new Date();
    fourteenDays.setDate(fourteenDays.getDate() + 14);
    
    return {
      critical: contracts.filter(c => new Date(c.endDate) <= sevenDays),
      warning: contracts.filter(c => {
        const endDate = new Date(c.endDate);
        return endDate > sevenDays && endDate <= fourteenDays;
      }),
      notice: contracts.filter(c => {
        const endDate = new Date(c.endDate);
        return endDate > fourteenDays;
      })
    };
  };

  return {
    contracts,
    isLoading,
    error,
    refresh,
    count: contracts.length,
    groupedByExpiryTimeframe,
  };
}