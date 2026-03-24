import { NextRequest, NextResponse } from "next/server";
import { fetchPlayerDetail } from "@/lib/dataFetchers";

export async function GET(req: NextRequest) {
  const mode   = (req.nextUrl.searchParams.get("mode") ?? "ELO") as "ELO" | "DCPR";
  const name   = req.nextUrl.searchParams.get("name") ?? "";
  if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });
  try {
    const data = await fetchPlayerDetail(mode, name);
    if (!data) return NextResponse.json({ error: "Player not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
