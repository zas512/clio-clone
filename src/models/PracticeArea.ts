import { Schema, model, models, type InferSchemaType } from "mongoose";

const practiceAreaSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    defaultHourlyRate: { type: Number },
    statuses: {
      type: [String],
      default: ["Intake", "Active", "Awaiting Client", "Closed"]
    }
  },
  { timestamps: true }
);

export type IPracticeArea = InferSchemaType<typeof practiceAreaSchema> & {
  _id: string;
};

export const PracticeArea =
  models.PracticeArea || model("PracticeArea", practiceAreaSchema);
