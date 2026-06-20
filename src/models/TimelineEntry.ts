import { Schema, model, models, type InferSchemaType, type Types } from "mongoose";

const timelineEntrySchema = new Schema(
  {
    matterId: { type: Schema.Types.ObjectId, ref: "Matter", required: true },
    type: {
      type: String,
      enum: [
        "note",
        "status_change",
        "document",
        "time_entry",
        "invoice",
        "message",
        "deadline",
        "system"
      ],
      required: true
    },
    summary: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    isClientCommunication: { type: Boolean, default: false },
    createdById: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type ITimelineEntry = InferSchemaType<typeof timelineEntrySchema> & {
  _id: Types.ObjectId;
};

export const TimelineEntry =
  models.TimelineEntry || model("TimelineEntry", timelineEntrySchema);
