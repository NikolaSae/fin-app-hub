// schemas/complaint.ts
import { z } from "zod";
import { ComplaintStatus, Priority, ComplaintType } from "@prisma/client";

export const ComplaintFormSchema = z.object({
  title: z.string().min(5, "Naslov mora imati najmanje 5 karaktera").max(100, "Naslov može imati najviše 100 karaktera"),
  description: z.string().min(10, "Opis mora imati najmanje 10 karaktera").max(2000, "Opis može imati najviše 2000 karaktera"),
  type: z.nativeEnum(ComplaintType, {
    errorMap: () => ({ message: "Izaberite tip reklamacije" }),
  }),
  priority: z.nativeEnum(Priority, {
    errorMap: () => ({ message: "Izaberite prioritet reklamacije" }),
  }),
  productId: z.string().optional(),
});

export const CommentFormSchema = z.object({
  content: z.string().min(1, "Komentar ne može biti prazan").max(1000, "Komentar može imati najviše 1000 karaktera"),
});

export const AssignComplaintFormSchema = z.object({
  assignedToId: z.string().min(1, "Izaberite agenta"),
});

export const ResolveComplaintFormSchema = z.object({
  resolution: z.string().min(10, "Rešenje mora imati najmanje 10 karaktera").max(2000, "Rešenje može imati najviše 2000 karaktera"),
  status: z.enum([ComplaintStatus.RESOLVED, ComplaintStatus.REJECTED], {
    errorMap: () => ({ message: "Izaberite konačni status reklamacije" }),
  }),
});

export const AttachmentFormSchema = z.object({
  fileName: z.string().min(1, "Naziv fajla je obavezan"),
  fileType: z.string().min(1, "Tip fajla je obavezan"),
  fileSize: z.number().min(1, "Veličina fajla mora biti veća od 0"),
  fileUrl: z.string().min(1, "URL fajla je obavezan"),
});