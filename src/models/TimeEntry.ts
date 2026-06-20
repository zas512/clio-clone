import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Types
} from "mongoose";

const timeEntrySchema = new Schema(
  {
    matterId: { type: Schema.Types.ObjectId, ref: "Matter", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    clientFacingDescription: { type: String, default: "" },
    internalNote: { type: String, default: "" },
    durationMs: { type: Number, required: true },
    rate: { type: Number, required: true },
    lineAmount: { type: Number, required: true },
    invoiced: { type: Boolean, default: false },
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice" }
  },
  { timestamps: true }
);

export type ITimeEntry = InferSchemaType<typeof timeEntrySchema> & {
  _id: Types.ObjectId;
};

export const TimeEntry =
  models.TimeEntry || model("TimeEntry", timeEntrySchema);
