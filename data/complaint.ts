// data/complaint.ts
import { db } from "@/lib/db";

export const getComplaintById = async (id: string) => {
  try {
    const complaint = await db.complaint.findUnique({
      where: { id },
      include: {
        user: true,
        product: true,
        assignedTo: true,
        comments: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        attachments: true,
        history: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return complaint;
  } catch (error) {
    console.error("[GET_COMPLAINT_BY_ID]", error);
    return null;
  }
};

export const getComplaintsByUserId = async (userId: string) => {
  try {
    const complaints = await db.complaint.findMany({
      where: { userId },
      include: {
        product: true,
        assignedTo: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return complaints;
  } catch (error) {
    console.error("[GET_COMPLAINTS_BY_USER]", error);
    return [];
  }
};

export const getAllComplaints = async () => {
  try {
    const complaints = await db.complaint.findMany({
      include: {
        user: true,
        product: true,
        assignedTo: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return complaints;
  } catch (error) {
    console.error("[GET_ALL_COMPLAINTS]", error);
    return [];
  }
};

export const getAssignedComplaints = async (userId: string) => {
  try {
    const complaints = await db.complaint.findMany({
      where: { assignedToId: userId },
      include: {
        user: true,
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return complaints;
  } catch (error) {
    console.error("[GET_ASSIGNED_COMPLAINTS]", error);
    return [];
  }
};