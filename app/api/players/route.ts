import { NextResponse } from "next/server";
import { fetchStandingsPlayers } from "@/lib/sheets";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") === "DCPR" ? "DCPR" : "ELO";

  try {
    const players = await fetchStandingsPlayers(mode);
    return NextResponse.json(players);
  } catch (error) {
    console.error("Players API error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
