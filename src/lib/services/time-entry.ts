import {
  Matter,
  TimeEntry,
  TimelineEntry,
  User
} from "@/models";
import { logAuditEvent } from "./audit";
import {
  computeLineAmount,
  resolveHourlyRate
} from "./rate-resolution";

type CreateTimeEntryInput = {
  matterId: string;
  userId: string;
  clientFacingDescription: string;
  internalNote: string;
  durationMs: number;
};

export async function createTimeEntry(input: CreateTimeEntryInput & { rate?: number }) {
  const rate = input.rate !== undefined ? input.rate : await resolveHourlyRate({
    matterId: input.matterId,
    userId: input.userId
  });

  const lineAmount = computeLineAmount(input.durationMs, rate);

  const entry = await TimeEntry.create({
    matterId: input.matterId,
    userId: input.userId,
    clientFacingDescription: input.clientFacingDescription,
    internalNote: input.internalNote,
    durationMs: input.durationMs,
    rate,
    lineAmount
  });

  await Matter.findByIdAndUpdate(input.matterId, {
    lastActivityAt: new Date()
  });

  const hours = (input.durationMs / (1000 * 60 * 60)).toFixed(2);
  await TimelineEntry.create({
    matterId: input.matterId,
    type: "time_entry",
    summary: `Time entry: ${hours}h — ${input.clientFacingDescription || "No description"}`,
    metadata: { timeEntryId: entry._id, rate, lineAmount },
    createdById: input.userId
  });

  await logAuditEvent({
    userId: input.userId,
    action: "create",
    recordType: "time_entry",
    recordId: entry._id.toString(),
    description: `Logged ${hours}h on matter ${input.matterId}`
  });

  return entry;
}

export async function getDefaultUserId(): Promise<string> {
  const user = await User.findOne().sort({ createdAt: 1 }).lean();
  if (!user) {
    throw new Error("No users in database. Run POST /api/seed first.");
  }
  return user._id.toString();
}
