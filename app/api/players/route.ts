import { NextResponse } from "next/server";
import { fetchStandingsPlayers } from "@/lib/sheets";
import { getNameFilter } from "@/lib/regionFilter";
import { snapshotGet, snapshotKey } from "@/lib/kvCache";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode   = searchParams.get("mode") === "DCPR" ? "DCPR" : "ELO";
  const region = searchParams.get("region") ?? "ALL";

  // Serve from snapshot if available
  const snap = await snapshotGet(snapshotKey("players", mode, region));
  if (snap) return NextResponse.json(snap);

  // Fallback: live fetch
  try {
    const nameFilter = await getNameFilter(region, mode);
    const players    = await fetchStandingsPlayers(mode, nameFilter);
    return NextResponse.json(players);
  } catch (error) {
    console.error("Players API error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
