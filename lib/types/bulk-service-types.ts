//lib/types/bulk-service-types.ts

import { BulkService, Provider, Service } from "@prisma/client";

// Enhanced types with relations
export interface BulkServiceWithRelations extends BulkService {
  provider: Provider;
  service: Service;
}

// Filters for bulk services
export interface BulkServiceFilters {
  providerId?: string;
  serviceId?: string;
  providerName?: string;
  serviceName?: string;
  senderName?: string;
  startDate?: Date;
  endDate?: Date;
}

// Statistics for bulk services
export interface BulkServiceStats {
  totalRequests: number;
  totalMessageParts: number;
  providerDistribution: {
    providerId: string;
    providerName: string;
    requestCount: number;
    messagePartCount: number;
    percentage: number;
  }[];
  serviceDistribution: {
    serviceId: string;
    serviceName: string;
    requestCount: number;
    messagePartCount: number;
    percentage: number;
  }[];
  timeSeriesData?: {
    date: string;
    requests: number;
    messageParts: number;
  }[];
}

// Data structure for CSV import results
export interface BulkServiceImportResult {
  imported: number;
  errors: number;
  errorDetails?: Array<{
    row: number;
    error: string;
    data?: Record<string, any>;
  }>;
}

// Structure for bulk service CSV row
export interface BulkServiceCSVData {
  provider_name: string;
  agreement_name: string;
  service_name: string;
  step_name: string;
  sender_name: string;
  requests: number;
  message_parts: number;
}

// Response structure for paginated bulk services
export interface PaginatedBulkServices {
  data: BulkServiceWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form submission data structure
export interface BulkServiceFormValues {
  provider_name: string;
  agreement_name: string;
  service_name: string;
  step_name: string;
  sender_name: string;
  requests: number;
  message_parts: number;
  serviceId: string;
  providerId: string;
}

// Structure for logging bulk service actions
export interface BulkServiceLogData {
  action: string;
  entityId: string;
  details?: string;
  userId: string;
}