// /schemas/contract.ts
import { z } from 'zod';
import { ContractStatus, ContractType } from '@prisma/client';

// Create a schema for the services array
const serviceSchema = z.object({
  serviceId: z.string().min(1, "Service ID is required"),
  specificTerms: z.string().optional().nullable()
});

// Define the base contract schema
const baseContractSchema = z.object({
  name: z.string().min(1, { message: "Contract name is required" }),
  contractNumber: z.string().min(1, { message: "Contract number is required" }),
  type: z.nativeEnum(ContractType, {
    errorMap: () => ({ message: "Invalid contract type" }),
  }),
  status: z.string(), // Changed from enum to string to match the form data structure
  startDate: z.string().refine((val) => !isNaN(new Date(val).getTime()), {
    message: "Start date is required and must be a valid date",
  }),
  endDate: z.string().refine((val) => !isNaN(new Date(val).getTime()), {
    message: "End date is required and must be a valid date",
  }),
  revenuePercentage: z.number()
    .min(0, { message: "Revenue percentage cannot be negative" })
    .max(100, { message: "Revenue percentage cannot exceed 100" })
    .default(10),
  description: z.string().optional().nullable(),
  // Conditional entity IDs - remove strict CUID validation
  providerId: z.string().optional().nullable(),
  humanitarianOrgId: z.string().optional().nullable(),
  parkingServiceId: z.string().optional().nullable(),
  // Services with specific terms
  services: z.array(serviceSchema).default([])
});

export const contractSchema = baseContractSchema.superRefine((data, ctx) => {
  // Date validation - parse dates for comparison
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  if (endDate < startDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End date must be after start date",
      path: ['endDate'],
    });
  }

  // Entity validation
  switch (data.type) {
    case ContractType.PROVIDER:
      if (!data.providerId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Provider is required for provider contracts',
          path: ['providerId'],
        });
      }
      break;
    case ContractType.HUMANITARIAN:
      if (!data.humanitarianOrgId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Humanitarian organization is required for humanitarian contracts',
          path: ['humanitarianOrgId'],
        });
      }
      break;
    case ContractType.PARKING:
      if (!data.parkingServiceId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Parking service is required for parking contracts',
          path: ['parkingServiceId'],
        });
      }
      break;
    default:
      break;
  }

  // Service validation
  if (!data.services || data.services.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one service is required",
      path: ['services'],
    });
  } else if (data.services.some(s => !s.serviceId)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "All services must have a valid service ID",
      path: ['services'],
    });
  }
});

export type ContractFormData = z.infer<typeof contractSchema>;