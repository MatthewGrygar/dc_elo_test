import { NextResponse } from "next/server";
import { fetchDashboardData } from "@/lib/sheets";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") === "DCPR" ? "DCPR" : "ELO";
  try {
    const data = await fetchDashboardData(mode);
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ stats: {}, players: [], topMatchElo: [], topMatchDiff: [] }, { status: 200 });
  }
}
