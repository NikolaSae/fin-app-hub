///lib/types/parking-service-types.ts

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
}

// Type for filtering parking services
export interface ParkingServiceFilters {
  searchTerm?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
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