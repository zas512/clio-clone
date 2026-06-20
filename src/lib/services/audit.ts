import { AuditLog } from "@/models";
import type { Types } from "mongoose";

type AuditParams = {
  userId?: Types.ObjectId | string;
  action: string;
  recordType: string;
  recordId: string;
  description: string;
};

export async function logAuditEvent(params: AuditParams) {
  await AuditLog.create(params);
}
