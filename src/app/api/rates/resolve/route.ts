import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/mongodb";
import { resolveHourlyRate } from "@/lib/services/rate-resolution";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const matterId = searchParams.get("matterId");
  const userId = searchParams.get("userId");

  if (!matterId || !userId) {
    return NextResponse.json(
      { error: "matterId and userId are required" },
      { status: 400 }
    );
  }

  // Handle mock data fallback if DB is not configured
  if (!isDbConfigured()) {
    let rate = 300;
    if (matterId === "m1") rate = 350; // Family Law rate / Sarah Lee rate
    if (matterId === "m2") rate = 325; // Estate Planning rate
    if (matterId === "m3") rate = 300; // Immigration rate / David Kim rate
    return NextResponse.json({ rate });
  }

  try {
    const rate = await resolveHourlyRate({ matterId, userId });
    return NextResponse.json({ rate });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to resolve rate";
    return NextResponse.json({ error: message, rate: 0 });
  }
}
