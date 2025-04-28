// /schemas/complaint.ts



import { z } from "zod";
import { ComplaintStatus, ComplaintPriority } from "@prisma/client";

// Schema for normal complaint creation
export const ComplaintSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters long" }).max(100),
  description: z.string().min(10, { message: "Description must be at least 10 characters long" }),
  priority: z.nativeEnum(ComplaintPriority, {
    errorMap: () => ({ message: "Please select a valid priority" }),
  }),
  serviceId: z.string().optional().nullable(),
  productId: z.string().optional().nullable(),
  providerId: z.string().optional().nullable(),
  financialImpact: z.number().optional().nullable(),
  attachments: z.array(z.string()).optional(),
});

// Schema specifically for CSV import
export const ComplaintImportSchema = z.object({
  title: z.string().min(2, { message: "Title is required" }),
  description: z.string().min(2, { message: "Description is required" }),
  priority: z.number().int().min(1).max(5).default(3),
  serviceId: z.string().optional().nullable(),
  productId: z.string().optional().nullable(),
  providerId: z.string().optional().nullable(),
  financialImpact: z.number().optional().nullable(),
});

// Schema for updating complaint status
export const ComplaintStatusUpdateSchema = z.object({
  status: z.nativeEnum(ComplaintStatus),
  comment: z.string().optional(),
});

// Schema for adding comments to a complaint
export const ComplaintCommentSchema = z.object({
  content: z.string().min(1, { message: "Comment cannot be empty" }).max(1000),
});

// Schema for filtering complaints in listings
export const ComplaintFilterSchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  serviceId: z.string().optional(),
  providerId: z.string().optional(),
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  search: z.string().optional(),
});

export type ComplaintFormValues = z.infer<typeof ComplaintSchema>;
export type ComplaintStatusUpdate = z.infer<typeof ComplaintStatusUpdateSchema>;
export type ComplaintComment = z.infer<typeof ComplaintCommentSchema>;
export type ComplaintFilter = z.infer<typeof ComplaintFilterSchema>;