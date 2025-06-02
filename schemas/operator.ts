// schemas/operator.ts
import { z } from "zod";

// Operator creation/update schema
export const operatorSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase(),
  
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, "Invalid phone number format")
    .min(10, "Phone number must be at least 10 characters"),
  
  address: z
    .string()
    .min(1, "Address is required")
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must be less than 200 characters"),
  
  city: z
    .string()
    .min(1, "City is required")
    .min(2, "City must be at least 2 characters")
    .max(50, "City must be less than 50 characters"),
  
  postalCode: z
    .string()
    .min(1, "Postal code is required")
    .regex(/^[0-9]{5}(-[0-9]{4})?$/, "Invalid postal code format"),
  
  country: z
    .string()
    .min(1, "Country is required")
    .min(2, "Country must be at least 2 characters")
    .max(50, "Country must be less than 50 characters"),
  
  licenseNumber: z
    .string()
    .min(1, "License number is required")
    .min(5, "License number must be at least 5 characters")
    .max(50, "License number must be less than 50 characters"),
  
  taxId: z
    .string()
    .min(1, "Tax ID is required")
    .min(5, "Tax ID must be at least 5 characters")
    .max(50, "Tax ID must be less than 50 characters"),
  
  bankAccount: z
    .string()
    .min(1, "Bank account is required")
    .regex(/^[0-9\-\s]+$/, "Invalid bank account format")
    .min(10, "Bank account must be at least 10 characters"),
  
  contactPerson: z
    .string()
    .min(1, "Contact person is required")
    .min(2, "Contact person name must be at least 2 characters")
    .max(100, "Contact person name must be less than 100 characters"),
  
  contactPhone: z
    .string()
    .min(1, "Contact phone is required")
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, "Invalid contact phone format")
    .min(10, "Contact phone must be at least 10 characters"),
  
  website: z
    .string()
    .url("Invalid website URL")
    .optional()
    .or(z.literal("")),
  
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
  
  isActive: z.boolean().default(true),
});

// Operator filter schema
export const operatorFilterSchema = z.object({
  search: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(["name", "email", "city", "createdAt", "updatedAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

// Operator update schema (allows partial updates)
export const operatorUpdateSchema = operatorSchema.partial().extend({
  id: z.string().min(1, "Operator ID is required"),
});

// Operator activation schema
export const operatorActivationSchema = z.object({
  id: z.string().min(1, "Operator ID is required"),
  isActive: z.boolean(),
});

// Operator bulk operation schema
export const operatorBulkOperationSchema = z.object({
  operatorIds: z.array(z.string().min(1)).min(1, "At least one operator must be selected"),
  operation: z.enum(["activate", "deactivate", "delete"], {
    errorMap: () => ({ message: "Invalid operation selected" }),
  }),
});

// Operator import schema
export const operatorImportSchema = z.object({
  operators: z.array(operatorSchema.omit({ isActive: true })),
  overwriteExisting: z.boolean().default(false),
});

// Operator export schema
export const operatorExportSchema = z.object({
  format: z.enum(["CSV", "XLSX", "JSON"]).default("CSV"),
  includeInactive: z.boolean().default(false),
  fields: z.array(z.string()).optional(), // Specific fields to export
});

// Types derived from schemas
export type OperatorFormData = z.infer<typeof operatorSchema>;
export type OperatorFilterData = z.infer<typeof operatorFilterSchema>;
export type OperatorUpdateData = z.infer<typeof operatorUpdateSchema>;
export type OperatorActivationData = z.infer<typeof operatorActivationSchema>;
export type OperatorBulkOperationData = z.infer<typeof operatorBulkOperationSchema>;
export type OperatorImportData = z.infer<typeof operatorImportSchema>;
export type OperatorExportData = z.infer<typeof operatorExportSchema>;