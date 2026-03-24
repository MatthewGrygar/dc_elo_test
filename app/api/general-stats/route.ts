import { NextRequest, NextResponse } from "next/server";
import { fetchGeneralStats } from "@/lib/dataFetchers";

export async function GET(req: NextRequest) {
  const mode = (req.nextUrl.searchParams.get("mode") ?? "ELO") as "ELO" | "DCPR";
  try {
    const data = await fetchGeneralStats(mode);
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
