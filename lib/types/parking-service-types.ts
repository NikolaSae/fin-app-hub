// lib/types/parking-service-types.ts

// Types for Parking Services
import { ParkingService } from "@prisma/client";

// Base Parking Service type from Prisma schema
export type ParkingServiceType = ParkingService;

// Type for creating a new parking service
export interface CreateParkingServiceParams {
  name: string;
  description?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
  additionalEmails?: string[];
  originalFileName?: string;
  originalFilePath?: string;
  fileSize?: number;
  mimeType?: string;
  lastImportDate?: Date;
  importedBy?: string;
  importStatus?: 'success' | 'failed' | 'in_progress';
}

// Type for updating an existing parking service
export interface UpdateParkingServiceParams {
  id: string;
  name?: string;
  description?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
  additionalEmails?: string[];
  originalFileName?: string;
  originalFilePath?: string;
  fileSize?: number;
  mimeType?: string;
  lastImportDate?: Date;
  importedBy?: string;
  importStatus?: 'success' | 'failed' | 'in_progress';
}

// Type for filtering parking services
export interface ParkingServiceFilters {
  searchTerm?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'lastImportDate';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  hasImportedFiles?: boolean; // Filter by services with imported files
}

// Type for parking service with associated contracts
export interface ParkingServiceWithContracts extends ParkingServiceType {
  contracts: {
    id: string;
    name: string;
    contractNumber: string;
    status: string;
    startDate: Date;
    endDate: Date;
  }[];
}

// Type for paginated parking services response
export interface PaginatedParkingServices {
  parkingServices: ParkingServiceType[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Type for file upload tracking
export interface FileUploadInfo {
  originalFileName: string;
  originalFilePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
}

// Type for import status update
export interface ImportStatusUpdate {
  parkingServiceId: string;
  importStatus: 'success' | 'failed' | 'in_progress';
  lastImportDate: Date;
  importedBy: string;
  errorMessage?: string;
}
export interface ParkingServiceFormData {
  id?: string;
  name: string;
  contactName?: string;
  email?: string;
  additionalEmails?: string; // String for form input (comma-separated)
  phone?: string;
  address?: string;
  description?: string;
  isActive: boolean;
}