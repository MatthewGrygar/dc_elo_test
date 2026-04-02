import { NextResponse } from "next/server";
import { fetchDashboardData, fetchRecentMatches } from "@/lib/sheets";
import { getVisibleMilestones, getFeaturedMatchIds } from "@/lib/pinned";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") === "DCPR" ? "DCPR" : "ELO";
  try {
    const [data, pinnedMs, featuredIds] = await Promise.all([
      fetchDashboardData(mode),
      getVisibleMilestones(),
      getFeaturedMatchIds(),
    ]);

    // Override milestones with admin-pinned ones if any exist
    const milestones =
      pinnedMs.length > 0
        ? pinnedMs.map((m) => ({ icon: m.icon, text: m.text, date: m.date, cat: m.cat }))
        : data.milestones;

    // Override interesting matches with admin-featured ones if any exist
    let topMatchElo = data.topMatchElo;
    let topMatchDiff = data.topMatchDiff;

    if (featuredIds.length > 0) {
      const allRecent = await fetchRecentMatches(90);
      const featuredSet = new Set(featuredIds);
      const featured = allRecent.filter((m) => featuredSet.has(m.matchId));
      if (featured.length > 0) {
        // Split featured evenly between the two slots (first half → ELO slot, rest → diff slot)
        const half = Math.ceil(featured.length / 2);
        topMatchElo = featured.slice(0, half);
        topMatchDiff = featured.slice(half);
      }
    }

    return NextResponse.json({ ...data, milestones, topMatchElo, topMatchDiff });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { stats: {}, players: [], topMatchElo: [], topMatchDiff: [], milestones: [] },
      { status: 200 }
    );
  }
}
