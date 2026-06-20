import { Schema, model, models, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["attorney", "staff"], default: "attorney" },
    defaultHourlyRate: { type: Number, required: true, default: 300 }
  },
  { timestamps: true }
);

export type IUser = InferSchemaType<typeof userSchema> & { _id: string };

export const User = models.User || model("User", userSchema);
