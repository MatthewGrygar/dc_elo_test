import { NextResponse } from "next/server";
import { fetchDashboardData } from "@/lib/sheets";

// Returns auto-generated milestones from the ELO system (both modes merged, deduped)
export async function GET() {
  try {
    const [elo, dcpr] = await Promise.all([
      fetchDashboardData("ELO"),
      fetchDashboardData("DCPR"),
    ]);

    // Merge and deduplicate by text
    const seen = new Set<string>();
    const merged = [...elo.milestones, ...dcpr.milestones].filter((m) => {
      if (seen.has(m.text)) return false;
      seen.add(m.text);
      return true;
    });

    return NextResponse.json(merged, {
      headers: { "Cache-Control": "s-maxage=120, stale-while-revalidate=300" },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json([], { status: 200 });
  }
}
