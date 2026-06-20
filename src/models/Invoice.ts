import { Schema, model, models, type InferSchemaType, type Types } from "mongoose";

const invoiceStatuses = [
  "Draft",
  "Sent",
  "Paid",
  "Partially Paid",
  "Overdue"
] as const;

const invoiceSchema = new Schema(
  {
    matterId: { type: Schema.Types.ObjectId, ref: "Matter", required: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    status: { type: String, enum: invoiceStatuses, default: "Draft" },
    total: { type: Number, required: true, default: 0 },
    dueAt: { type: Date },
    sentAt: { type: Date },
    paidAt: { type: Date },
    paidAmount: { type: Number },
    finalizedAt: { type: Date }
  },
  { timestamps: true }
);

export type IInvoice = InferSchemaType<typeof invoiceSchema> & {
  _id: Types.ObjectId;
};
export type InvoiceStatus = (typeof invoiceStatuses)[number];

export const Invoice = models.Invoice || model("Invoice", invoiceSchema);
