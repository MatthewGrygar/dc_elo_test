import { NextRequest, NextResponse } from "next/server";
import { fetchAnalyticsData } from "@/lib/dataFetchers";
import { getNameFilter } from "@/lib/regionFilter";

export async function GET(req: NextRequest) {
  const mode = (req.nextUrl.searchParams.get("mode") ?? "ELO") as "ELO" | "DCPR";
  const region = req.nextUrl.searchParams.get("region") ?? "ALL";
  try {
    const nameFilter = await getNameFilter(region);
    const data = await fetchAnalyticsData(mode, nameFilter);
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
