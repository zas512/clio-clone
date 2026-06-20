import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/mongodb";
import {
  createTimeEntry,
  getDefaultUserId
} from "@/lib/services/time-entry";

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "MONGODB_URI not configured. Add it to .env.local first." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const {
      matterId,
      clientFacingDescription = "",
      internalNote = "",
      durationMs,
      timer
    } = body as {
      matterId: string;
      clientFacingDescription?: string;
      internalNote?: string;
      durationMs?: number;
      timer?: {
        startedAt: number;
        elapsedBeforePause: number;
        isPaused: boolean;
      };
    };

    if (!matterId) {
      return NextResponse.json({ error: "matterId is required" }, { status: 400 });
    }

    const resolvedDuration =
      durationMs ??
      (timer
        ? timer.isPaused
          ? timer.elapsedBeforePause
          : timer.elapsedBeforePause + (Date.now() - timer.startedAt)
        : 0);

    if (resolvedDuration <= 0) {
      return NextResponse.json(
        { error: "durationMs must be greater than 0" },
        { status: 400 }
      );
    }

    const userId = await getDefaultUserId();
    const entry = await createTimeEntry({
      matterId,
      userId,
      clientFacingDescription,
      internalNote,
      durationMs: resolvedDuration
    });

    return NextResponse.json({
      id: entry._id.toString(),
      rate: entry.rate,
      lineAmount: entry.lineAmount,
      durationMs: entry.durationMs
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save time entry";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
