// /lib/types/contract-types.ts

import { ContractStatus, ContractType, Service } from '@prisma/client';
import { z } from 'zod';
import { contractSchema } from '@/schemas/contract';

export type ContractFormData = z.infer<typeof contractSchema>;

export interface SelectedService {
  serviceId: string;
  specificTerms?: string;
}

export interface Contract {
  id: string;
  name: string;
  contractNumber: string;
  type: ContractType;
  status: ContractStatus;
  startDate: Date;
  endDate: Date;
  revenuePercentage: number;
  description: string | null;
  providerId: string | null;
  humanitarianOrgId: string | null;
  parkingServiceId: string | null;
  services?: (Service & { specificTerms?: string })[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceWithTerms extends Service {
  specificTerms?: string;
}

export interface FilterOptions {
  type?: ContractType | null;
  status?: ContractStatus | null;
  providerId?: string | null;
  humanitarianOrgId?: string | null;
  parkingServiceId?: string | null;
  search?: string | null;
  expiringWithin?: number | null;
  limit?: number;
}