import { NextResponse } from "next/server";
import { getMattersForTimer } from "@/lib/services/dashboard";

export async function GET() {
  const matters = await getMattersForTimer();
  return NextResponse.json(matters);
}
