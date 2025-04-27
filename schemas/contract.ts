// /schemas/contract.ts

import { z } from 'zod';
import { ContractStatus, ContractType } from '@prisma/client';

// Osnovna šema za podatke ugovora
  const contractSchema = z.object({ // Uklonjena export ključna reč
  name: z.string().min(1, { message: "Contract name is required" }),
  contractNumber: z.string().min(1, { message: "Contract number is required" }),
  type: z.nativeEnum(ContractType, {
     errorMap: () => ({ message: "Invalid contract type" }),
  }),
  status: z.nativeEnum(ContractStatus, {
     errorMap: () => ({ message: "Invalid contract status" }),
  }).default(ContractStatus.ACTIVE),
  startDate: z.string().refine((val) => !isNaN(new Date(val).getTime()), {
     message: "Start date is required and must be a valid date",
  }).transform((val) => new Date(val)),
  endDate: z.string().refine((val) => !isNaN(new Date(val).getTime()), {
     message: "End date is required and must be a valid date",
  }).transform((val) => new Date(val)),
  revenuePercentage: z.number().min(0, { message: "Revenue percentage cannot be negative" }).max(100, { message: "Revenue percentage cannot exceed 100" }).default(10),
  description: z.string().optional().nullable(),

  providerId: z.string().cuid("Invalid provider ID format").optional().nullable(),
  humanitarianOrgId: z.string().cuid("Invalid humanitarian organization ID format").optional().nullable(),
  parkingServiceId: z.string().cuid("Invalid parking service ID format").optional().nullable(),

  services: z.array(z.string().cuid("Invalid service ID in services list")).optional().nullable(),
});


// Dodatna validacija na nivou objekta (cross-field validation)
// Šema koja uključuje validaciju relacija
export const contractSchemaWithRelations = contractSchema.superRefine((data, ctx) => {
    // Validacija datuma
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "End date must be after start date",
            path: ['endDate'],
        });
    }

    // Uslovna validacija povezanih entiteta
    if (data.type === ContractType.PROVIDER && !data.providerId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Provider is required for provider contracts",
            path: ['providerId'],
        });
    }

    if (data.type === ContractType.HUMANITARIAN && !data.humanitarianOrgId) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Humanitarian organization is required for humanitarian contracts",
            path: ['humanitarianOrgId'],
        });
    }

    if (data.type === ContractType.PARKING && !data.parkingServiceId) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Parking service is required for parking contracts",
            path: ['parkingServiceId'],
        });
    }

    // Opciono: Provera da samo JEDAN od specifičnih ID-jeva postoji ako tip nije null
    const relatedIds = [data.providerId, data.humanitarianOrgId, data.parkingServiceId].filter(Boolean);
    if (data.type && relatedIds.length > 1) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Only one related entity (${data.type.toLowerCase()}) should be provided for this contract type.`,
            path: ['type'],
        });
    }
     if (!data.type && relatedIds.length > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Related entity ID provided without a specified contract type.",
            path: ['type'],
        });
     }
});


// Tip koji se izvodi iz Zod šeme sa validacijom relacija
export type ContractFormData = z.infer<typeof contractSchemaWithRelations>;

// Izvozimo unapređenu šemu pod imenom 'contractSchema' kako bi bila dostupna drugim modulima
export { contractSchemaWithRelations as contractSchema };