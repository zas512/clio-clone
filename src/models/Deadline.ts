import { Schema, model, models, type InferSchemaType, type Types } from "mongoose";

const deadlineSchema = new Schema(
  {
    matterId: { type: Schema.Types.ObjectId, ref: "Matter" },
    title: { type: String, required: true },
    dueAt: { type: Date, required: true },
    completedAt: { type: Date },
    isDeadline: { type: Boolean, default: true },
    assignedToId: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export type IDeadline = InferSchemaType<typeof deadlineSchema> & {
  _id: Types.ObjectId;
};

export const Deadline = models.Deadline || model("Deadline", deadlineSchema);
