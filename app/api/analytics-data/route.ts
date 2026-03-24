import { NextRequest, NextResponse } from "next/server";
import { fetchAnalyticsData } from "@/lib/dataFetchers";

export async function GET(req: NextRequest) {
  const mode = (req.nextUrl.searchParams.get("mode") ?? "ELO") as "ELO" | "DCPR";
  try {
    const data = await fetchAnalyticsData(mode);
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
