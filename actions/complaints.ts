// actions/complaints.ts
"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { 
  ComplaintFormValues, 
  CommentFormValues,
  AssignComplaintFormValues,
  ResolveComplaintFormValues,
  AttachmentFormValues
} from "@/schemas";
import { ComplaintStatus, Priority, ComplaintType } from "@prisma/client";

export async function createComplaint(values: ComplaintFormValues) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return { error: "Niste prijavljeni." };
    }
    
    const complaint = await db.complaint.create({
      data: {
        title: values.title,
        description: values.description,
        type: values.type as ComplaintType,
        priority: values.priority as Priority,
        userId: user.id,
        productId: values.productId,
      },
    });
    
    await db.complaintHistory.create({
      data: {
        complaintId: complaint.id,
        newStatus: ComplaintStatus.PENDING,
        description: "Reklamacija je kreirana",
        userId: user.id,
      }
    });
    
    revalidatePath("/complaints");
    
    return { success: "Reklamacija je uspešno kreirana.", complaintId: complaint.id };
  } catch (error) {
    console.error("[CREATE_COMPLAINT]", error);
    return { error: "Došlo je do greške prilikom kreiranja reklamacije." };
  }
}

export async function updateComplaintStatus(
  complaintId: string, 
  status: ComplaintStatus, 
  description: string
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return { error: "Niste prijavljeni." };
    }
    
    const complaint = await db.complaint.findUnique({
      where: { id: complaintId },
    });
    
    if (!complaint) {
      return { error: "Reklamacija nije pronađena." };
    }
    
    // Provera dozvola - samo admin ili agent koji je dodeljen može menjati status
    if (user.role !== "ADMIN" && complaint.assignedToId !== user.id) {
      return { error: "Nemate dozvolu za menjanje statusa ove reklamacije." };
    }
    
    await db.complaint.update({
      where: { id: complaintId },
      data: {
        status,
      },
    });
    
    await db.complaintHistory.create({
      data: {
        complaintId,
        oldStatus: complaint.status,
        newStatus: status,
        description,
        userId: user.id,
      }
    });
    
    revalidatePath(`/complaints/${complaintId}`);
    revalidatePath("/complaints");
    
    return { success: "Status reklamacije je uspešno promenjen." };
  } catch (error) {
    console.error("[UPDATE_COMPLAINT_STATUS]", error);
    return { error: "Došlo je do greške prilikom promene statusa reklamacije." };
  }
}

export async function assignComplaint(
  complaintId: string, 
  values: AssignComplaintFormValues
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return { error: "Niste prijavljeni." };
    }
    
    if (user.role !== "ADMIN") {
      return { error: "Nemate dozvolu za dodeljivanje reklamacija." };
    }
    
    const complaint = await db.complaint.findUnique({
      where: { id: complaintId },
    });
    
    if (!complaint) {
      return { error: "Reklamacija nije pronađena." };
    }
    
    await db.complaint.update({
      where: { id: complaintId },
      data: {
        assignedToId: values.assignedToId,
        status: ComplaintStatus.IN_PROGRESS,
      },
    });
    
    await db.complaintHistory.create({
      data: {
        complaintId,
        oldStatus: complaint.status,
        newStatus: ComplaintStatus.IN_PROGRESS,
        description: `Reklamacija je dodeljena agentu za rešavanje`,
        userId: user.id,
      }
    });
    
    revalidatePath(`/complaints/${complaintId}`);
    revalidatePath("/complaints");
    
    return { success: "Reklamacija je uspešno dodeljena agentu." };
  } catch (error) {
    console.error("[ASSIGN_COMPLAINT]", error);
    return { error: "Došlo je do greške prilikom dodeljivanja reklamacije." };
  }
}

export async function resolveComplaint(
  complaintId: string, 
  values: ResolveComplaintFormValues
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return { error: "Niste prijavljeni." };
    }
    
    const complaint = await db.complaint.findUnique({
      where: { id: complaintId },
    });
    
    if (!complaint) {
      return { error: "Reklamacija nije pronađena." };
    }
    
    // Samo admin ili dodeljeni agent mogu da reše reklamaciju
    if (user.role !== "ADMIN" && complaint.assignedToId !== user.id) {
      return { error: "Nemate dozvolu za rešavanje ove reklamacije." };
    }
    
    await db.complaint.update({
      where: { id: complaintId },
      data: {
        status: values.status as ComplaintStatus,
        resolution: values.resolution,
        resolvedAt: new Date(),
        resolvedById: user.id,
      },
    });
    
    await db.complaintHistory.create({
      data: {
        complaintId,
        oldStatus: complaint.status,
        newStatus: values.status as ComplaintStatus,
        description: `Reklamacija je ${values.status === "RESOLVED" ? "rešena" : "odbijena"}: ${values.resolution}`,
        userId: user.id,
      }
    });
    
    revalidatePath(`/complaints/${complaintId}`);
    revalidatePath("/complaints");
    
    return { success: `Reklamacija je uspešno ${values.status === "RESOLVED" ? "rešena" : "odbijena"}.` };
  } catch (error) {
    console.error("[RESOLVE_COMPLAINT]", error);
    return { error: "Došlo je do greške prilikom rešavanja reklamacije." };
  }
}

export async function addComment(
  complaintId: string, 
  values: CommentFormValues
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return { error: "Niste prijavljeni." };
    }
    
    const complaint = await db.complaint.findUnique({
      where: { id: complaintId },
    });
    
    if (!complaint) {
      return { error: "Reklamacija nije pronađena." };
    }
    
    // Provera dozvola - vlasnik reklamacije, admin ili dodeljeni agent mogu da komentarišu
    if (complaint.userId !== user.id && user.role !== "ADMIN" && complaint.assignedToId !== user.id) {
      return { error: "Nemate dozvolu za komentarisanje ove reklamacije." };
    }
    
    await db.complaintComment.create({
      data: {
        complaintId,
        content: values.content,
        userId: user.id,
      },
    });
    
    revalidatePath(`/complaints/${complaintId}`);
    
    return { success: "Komentar je uspešno dodat." };
  } catch (error) {
    console.error("[ADD_COMMENT]", error);
    return { error: "Došlo je do greške prilikom dodavanja komentara." };
  }
}

export async function uploadAttachment(
  complaintId: string,
  values: AttachmentFormValues
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return { error: "Niste prijavljeni." };
    }
    
    const complaint = await db.complaint.findUnique({
      where: { id: complaintId },
    });
    
    if (!complaint) {
      return { error: "Reklamacija nije pronađena." };
    }
    
    // Provera dozvola - vlasnik reklamacije, admin ili dodeljeni agent mogu da dodaju priloge
    if (complaint.userId !== user.id && user.role !== "ADMIN" && complaint.assignedToId !== user.id) {
      return { error: "Nemate dozvolu za dodavanje priloga ovoj reklamaciji." };
    }
    
    // Napomena: Ovde bi trebalo implementirati stvarno otpremanje fajla na server/cloud
    // Za sada beležimo samo metapodatke
    await db.attachment.create({
      data: {
        complaintId,
        fileName: values.fileName,
        fileType: values.fileType,
        fileSize: values.fileSize,
        fileUrl: values.fileUrl, // U stvarnom sistemu, ovo bi bio URL ka stvarnom fajlu
        userId: user.id,
      },
    });
    
    revalidatePath(`/complaints/${complaintId}`);
    
    return { success: "Prilog je uspešno dodat." };
  } catch (error) {
    console.error("[UPLOAD_ATTACHMENT]", error);
    return { error: "Došlo je do greške prilikom dodavanja priloga." };
  }
}