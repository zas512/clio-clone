import { Schema, model, models, type InferSchemaType, type Types } from "mongoose";

const auditLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    recordType: { type: String, required: true },
    recordId: { type: String, required: true },
    description: { type: String, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type IAuditLog = InferSchemaType<typeof auditLogSchema> & {
  _id: Types.ObjectId;
};

export const AuditLog = models.AuditLog || model("AuditLog", auditLogSchema);
