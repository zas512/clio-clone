import type { Types } from "mongoose";
import { Matter, PracticeArea, User } from "@/models";

export type RateContext = {
  matterId: Types.ObjectId | string;
  userId: Types.ObjectId | string;
};

/**
 * Rate resolution per spec 6.1:
 * matter override > practice-area override > attorney default.
 * Flat-fee/contingency matters return rate 0 (time tracked, not billed hourly).
 */
export async function resolveHourlyRate(
  ctx: RateContext
): Promise<number> {
  const matter = await Matter.findById(ctx.matterId)
    .populate("practiceAreaId")
    .lean();

  if (!matter) {
    throw new Error("Matter not found");
  }

  if (!matter.engagementSigned) {
    throw new Error(
      "Cannot bill time against a matter without a signed engagement"
    );
  }

  if (matter.billingType === "flat_fee" || matter.billingType === "contingency") {
    return 0;
  }

  if (matter.hourlyRateOverride != null) {
    return matter.hourlyRateOverride;
  }

  const practiceArea = matter.practiceAreaId as {
    defaultHourlyRate?: number;
  } | null;

  if (practiceArea?.defaultHourlyRate != null) {
    return practiceArea.defaultHourlyRate;
  }

  const user = await User.findById(ctx.userId).lean();
  if (!user) {
    throw new Error("User not found");
  }

  return user.defaultHourlyRate;
}

export function computeLineAmount(durationMs: number, rate: number): number {
  const hours = durationMs / (1000 * 60 * 60);
  return Math.round(hours * rate * 100) / 100;
}
