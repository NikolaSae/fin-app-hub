//lib/security/black-log.ts

import { prisma } from "@/lib/db";
import { LogBlackType } from "@prisma/client";

interface LogParams {
  action: LogBlackType;
  entityId: string;
  entityType?: string;
  userId: string;
  oldData?: any;
  newData?: any;
}

export async function createAuditLog(params: LogParams) {
  try {
    await prisma.blacklistLog.create({
      data: {
        action: params.action,
        entityId: params.entityId,
        entityType: params.entityType || "SenderBlacklist",
        userId: params.userId,
        oldData: params.oldData ? JSON.parse(JSON.stringify(params.oldData)) : undefined,
        newData: params.newData ? JSON.parse(JSON.stringify(params.newData)) : undefined,
      }
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}