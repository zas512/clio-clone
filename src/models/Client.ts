import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Types
} from "mongoose";

const clientSchema = new Schema(
  {
    contactName: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      unique: true,
      sparse: true
    },
    portalEnabled: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export type IClient = InferSchemaType<typeof clientSchema> & {
  _id: Types.ObjectId;
};

export const Client = models.Client || model("Client", clientSchema);
