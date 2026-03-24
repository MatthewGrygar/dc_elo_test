import { NextResponse } from "next/server";
import { fetchDashboardStats } from "@/lib/sheets";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") === "DCPR" ? "DCPR" : "ELO";

  try {
    const stats = await fetchDashboardStats(mode);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      {
        totalGames: 0, uniquePlayers: 0, medianElo: 1200, uniqueTournaments: 0,
        lastDataEntry: "—", activePlayers30d: 0, gamesLast30d: 0, newPlayers30d: 0, avgEloChange: 0,
      },
      { status: 200 }
    );
  }
}
