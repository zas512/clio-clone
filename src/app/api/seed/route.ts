import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/mongodb";
import { seedDatabase } from "@/lib/seed";

export async function POST() {
  if (!isDbConfigured()) {
    return NextResponse.json(
      {
        error:
          "MONGODB_URI not configured. Add your connection string to .env.local, then retry."
      },
      { status: 503 }
    );
  }

  try {
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Seed failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
