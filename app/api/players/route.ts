import { NextResponse } from "next/server";
import { fetchStandingsPlayers } from "@/lib/sheets";
import { getNameFilter } from "@/lib/regionFilter";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") === "DCPR" ? "DCPR" : "ELO";
  const region = searchParams.get("region") ?? "ALL";

  try {
    const nameFilter = await getNameFilter(region, mode);
    const players = await fetchStandingsPlayers(mode, nameFilter);
    return NextResponse.json(players);
  } catch (error) {
    console.error("Players API error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
