import { NextRequest, NextResponse } from "next/server";
import { getPlayerProfile } from "@/lib/pinned";

// GET /api/player-profile?player=Name
export async function GET(req: NextRequest) {
  const player = req.nextUrl.searchParams.get("player");
  if (!player) return NextResponse.json(null);
  const profile = await getPlayerProfile(player);
  return NextResponse.json(profile, { headers: { "Cache-Control": "no-store" } });
}
