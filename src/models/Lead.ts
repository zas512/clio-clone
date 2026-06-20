import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Types
} from "mongoose";

const leadStatuses = [
  "New",
  "Contacted",
  "Engagement Sent",
  "Converted",
  "Declined",
  "Lost"
] as const;

const leadSchema = new Schema(
  {
    contactName: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    matterDescription: { type: String, required: true },
    opposingParties: { type: [String], default: [] },
    referralSource: { type: String, default: "" },
    status: { type: String, enum: leadStatuses, default: "New" },
    receivedAt: { type: Date, default: Date.now },
    conflictFlags: { type: [String], default: [] },
    engagementSignedAt: { type: Date },
    convertedClientId: { type: Schema.Types.ObjectId, ref: "Client" }
  },
  { timestamps: true }
);

export type ILead = InferSchemaType<typeof leadSchema> & {
  _id: Types.ObjectId;
};
export type LeadStatus = (typeof leadStatuses)[number];

export const Lead = models.Lead || model("Lead", leadSchema);
