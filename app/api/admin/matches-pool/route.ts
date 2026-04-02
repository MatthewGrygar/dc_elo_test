import { NextResponse } from "next/server";
import { fetchRecentMatches } from "@/lib/sheets";

// GET /api/admin/matches-pool?days=60
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const days = Math.min(Number(searchParams.get("days") ?? 60), 365);
  try {
    const matches = await fetchRecentMatches(days);
    return NextResponse.json(matches, {
      headers: { "Cache-Control": "s-maxage=120, stale-while-revalidate=300" },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json([], { status: 200 });
  }
}
