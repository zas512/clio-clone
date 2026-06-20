import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Types
} from "mongoose";

const billingTypes = ["hourly", "flat_fee", "contingency"] as const;

const matterSchema = new Schema(
  {
    name: { type: String, required: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    practiceAreaId: {
      type: Schema.Types.ObjectId,
      ref: "PracticeArea",
      required: true
    },
    responsibleAttorneyId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: { type: String, required: true, default: "Active" },
    openDate: { type: Date, default: Date.now },
    closeDate: { type: Date },
    retainerAmount: { type: Number, default: 0 },
    retainerCollected: { type: Boolean, default: false },
    retainerCollectedAt: { type: Date },
    retainerCollectedAmount: { type: Number },
    hourlyRateOverride: { type: Number },
    billingType: { type: String, enum: billingTypes, default: "hourly" },
    lastActivityAt: { type: Date, default: Date.now },
    engagementSigned: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export type IMatter = InferSchemaType<typeof matterSchema> & {
  _id: Types.ObjectId;
};
export type BillingType = (typeof billingTypes)[number];

export const Matter = models.Matter || model("Matter", matterSchema);
