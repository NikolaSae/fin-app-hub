// schemas/operator.ts

import { z } from "zod";

export const operatorSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters long",
  }),
  code: z.string().min(2, {
    message: "Code must be at least 2 characters long",
  }).max(20, {
    message: "Code must not exceed 20 characters",
  }).regex(/^[a-zA-Z0-9_-]+$/, {
    message: "Code can only contain letters, numbers, underscores, and hyphens",
  }),
  description: z.string().optional(),
  logoUrl: z.string().url({
    message: "Please enter a valid URL",
  }).optional().nullable(),
  website: z.string().url({
    message: "Please enter a valid URL",
  }).optional().nullable(),
  contactEmail: z.string().email({
    message: "Please enter a valid email address",
  }).optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  active: z.boolean().default(true),
});