import { NextResponse } from "next/server";
import { isDbConfigured, connectDB } from "@/lib/mongodb";
import { TimeEntry } from "@/models/TimeEntry";
import { mockMatters } from "@/data";

// Helper function to return mock success
function returnMockSuccess(finalRate: number, lineAmount: number, durationMs: number) {
  return NextResponse.json({
    id: `entry-${Date.now()}`,
    rate: finalRate,
    lineAmount,
    durationMs
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      matterId,
      userId = "default-user",
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

    const finalRate = nonBillable ? 0 : Number(rate);
    const hours = durationMs / 3600000;
    const lineAmount = nonBillable ? 0 : Number((hours * finalRate).toFixed(2));

    if (!isDbConfigured()) {
      return returnMockSuccess(finalRate, lineAmount, durationMs);
    }

    // Try MongoDB case
    try {
      await connectDB();

      const entry = await TimeEntry.create({
        matterId,
        userId,
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
    } catch (dbError) {
      // Fall back to mock mode if DB fails
      console.warn("DB failed, falling back to mock mode:", dbError);
      return returnMockSuccess(finalRate, lineAmount, durationMs);
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to save time entry";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
