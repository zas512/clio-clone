import { NextResponse } from "next/server";
import { isDbConfigured, connectDB } from "@/lib/mongodb";
import { TimeEntry } from "@/models/TimeEntry";
import { User } from "@/models/User";

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "MONGODB_URI not configured. Add it to .env.local first." },
      { status: 503 }
    );
  }

  try {
    await connectDB();

    const body = await request.json();
    const {
      matterId,
      userId,
      clientFacingDescription = "",
      internalNote = "",
      durationMs,
      rate = 0,
      activityCategory = "",
      date,
      nonBillable = false,
      writtenOff = false,
      showOnBill = true
    } = body;

    if (!matterId) {
      return NextResponse.json(
        { error: "matterId is required" },
        { status: 400 }
      );
    }

    if (!durationMs || durationMs <= 0) {
      return NextResponse.json(
        { error: "durationMs must be greater than 0" },
        { status: 400 }
      );
    }

    let resolvedUserId = userId;
    if (!resolvedUserId) {
      const defaultUser = await User.findOne().sort({ createdAt: 1 });
      if (!defaultUser) {
        return NextResponse.json({ error: "No users found" }, { status: 400 });
      }
      resolvedUserId = defaultUser._id.toString();
    }

    const finalRate = nonBillable ? 0 : Number(rate);
    const hours = durationMs / 3600000;
    const lineAmount = nonBillable ? 0 : Number((hours * finalRate).toFixed(2));

    const entry = await TimeEntry.create({
      matterId,
      userId: resolvedUserId,
      clientFacingDescription,
      internalNote,
      durationMs,
      rate: finalRate,
      lineAmount,
      activityCategory,
      date: date ? new Date(date) : new Date(),
      nonBillable,
      writtenOff,
      showOnBill
    });

    return NextResponse.json({
      id: entry._id.toString(),
      rate: entry.rate,
      lineAmount: entry.lineAmount,
      durationMs: entry.durationMs
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to save time entry";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
