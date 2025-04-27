// /schemas/complaint.ts



import { z } from "zod";

import { ComplaintStatus } from "@prisma/client";

export const complaintSchema = z.object({

title: z.string().min(5, "Title must be at least 5 characters"),

description: z.string().min(10, "Description must be at least 10 characters"),

status: z.nativeEnum(ComplaintStatus).default("NEW"),

priority: z.number().int().min(1).max(5).default(3),

financialImpact: z.number().optional(),

serviceId: z.string().optional(),

productId: z.string().optional(),

providerId: z.string().optional(),

assignedAgentId: z.string().optional(),

});

export const complaintUpdateSchema = complaintSchema.partial().extend({

id: z.string(),

});

export const complaintFilterSchema = z.object({

status: z.nativeEnum(ComplaintStatus).optional(),

priority: z.number().int().min(1).max(5).optional(),

serviceId: z.string().optional(),

productId: z.string().optional(),

providerId: z.string().optional(),

assignedAgentId: z.string().optional(),

submittedById: z.string().optional(),

dateFrom: z.date().optional(),

dateTo: z.date().optional(),

});

export const complaintCommentSchema = z.object({

text: z.string().min(1, "Comment cannot be empty"),

complaintId: z.string(),

isInternal: z.boolean().default(false),

});

export const statusUpdateSchema = z.object({

complaintId: z.string(),

status: z.nativeEnum(ComplaintStatus),

notes: z.string().optional(),

});