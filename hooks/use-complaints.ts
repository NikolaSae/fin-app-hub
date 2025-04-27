// hooks/use-complaints.ts
import { useState, useEffect, useCallback } from "react";
import { ComplaintStatus } from "@/lib/types/enums"; 
import { Complaint, ComplaintWithRelations } from "@/lib/types/complaint-types";

interface UseComplaintsParams {
  id?: string;
  status?: ComplaintStatus;
  serviceId?: string | null;
  providerId?: string | null;
  productId?: string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;  
  search?: string | null;
  limit?: number;
  page?: number;
}

interface UseComplaintsResult {
  complaints: ComplaintWithRelations[];
  complaint: ComplaintWithRelations | null;
  isLoading: boolean;
  error: Error | null;
  totalCount: number;
  totalPages: number;
  refresh: () => Promise<void>;
}

export function useComplaints(params: UseComplaintsParams = {}): UseComplaintsResult {
  const [complaints, setComplaints] = useState<ComplaintWithRelations[]>([]);
  const [complaint, setComplaint] = useState<ComplaintWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Extract all params to individual variables to use in dependencies
  const { 
    id, 
    status, 
    serviceId, 
    providerId, 
    productId, 
    startDate, 
    endDate, 
    search, 
    limit, 
    page 
  } = params;

  const fetchComplaints = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const getValidDate = (dateParam?: Date | string | null): Date | undefined => {
      if (!dateParam) return undefined;
      const date = dateParam instanceof Date ? dateParam : new Date(dateParam);
      return isNaN(date.getTime()) ? undefined : date;
    };

    try {
      const queryParams = new URLSearchParams();

      if (id) {
        // Fetch single complaint
        const response = await fetch(`/api/complaints/${id}`);

        if (!response.ok) {
          throw new Error(`Error fetching complaint: ${response.statusText}`);
        }

        const data = await response.json();
        setComplaint(data);
        setTotalCount(data.totalCount || 1);
        setTotalPages(data.totalPages || 1);
        setComplaints(data.complaints || [data]);
        return;
      }

      // Build query parameters for complaints list
      if (status) queryParams.append("status", status);
      if (serviceId) queryParams.append("serviceId", serviceId);
      if (providerId) queryParams.append("providerId", providerId);
      if (productId) queryParams.append("productId", productId);

      const validStartDate = getValidDate(startDate);
      if (validStartDate) {
          queryParams.append("startDate", validStartDate.toISOString());
      }

      const validEndDate = getValidDate(endDate);
      if (validEndDate) {
          queryParams.append("endDate", validEndDate.toISOString());
      }

      if (search) queryParams.append("search", search);
      if (limit) queryParams.append("limit", limit.toString());
      if (page) queryParams.append("page", page.toString());

      const response = await fetch(`/api/complaints?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(`Error fetching complaints: ${response.statusText}`);
      }

      const data = await response.json();
      setComplaints(data.complaints || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 0);

    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setComplaints([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    id, 
    status, 
    serviceId, 
    providerId, 
    productId, 
    startDate, 
    endDate, 
    search, 
    limit, 
    page
  ]); // List all individual parameters instead of the entire params object

  useEffect(() => {
    // Add a condition to prevent unnecessary calls
    if (id || (!id && (page !== undefined || Object.keys(params).length === 0))) {
      let isMounted = true;
      
      const fetchData = async () => {
        if (isMounted) {
          await fetchComplaints();
        }
      };
      
      fetchData();
      
      // Cleanup function to prevent state updates if component unmounts
      return () => {
        isMounted = false;
      };
    }
  }, [fetchComplaints]); // Only depend on fetchComplaints

  const refresh = useCallback(async () => {
    await fetchComplaints();
  }, [fetchComplaints]);

  return {
    complaints,
    complaint,
    isLoading,
    error,
    totalCount,
    totalPages,
    refresh
  };
}