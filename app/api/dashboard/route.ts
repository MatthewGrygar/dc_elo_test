import { NextResponse } from "next/server";
import { fetchDashboardData, fetchRecentMatches, type InterestingMatch } from "@/lib/sheets";
import { getVisibleMilestones, getFeaturedMatches } from "@/lib/pinned";
import { getNameFilter } from "@/lib/regionFilter";

export interface MatchGroup {
  label: string;
  emoji: string;
  matches: InterestingMatch[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") === "DCPR" ? "DCPR" : "ELO";
  const region = searchParams.get("region") ?? "ALL";
  try {
    const nameFilter = await getNameFilter(region);
    const [data, pinnedMs, featuredMs] = await Promise.all([
      fetchDashboardData(mode, nameFilter),
      getVisibleMilestones(),
      getFeaturedMatches(),
    ]);

    // Override milestones with admin-pinned ones if any exist
    const milestones =
      pinnedMs.length > 0
        ? pinnedMs.map((m) => ({ icon: m.icon, text: m.text, date: m.date, cat: m.cat }))
        : data.milestones;

    // Build match groups
    let matchGroups: MatchGroup[];

    if (featuredMs.length > 0) {
      const allRecent = await fetchRecentMatches(90);
      const matchMap = new Map(allRecent.map((m) => [m.matchId, m]));

      // Group by category key (category + label)
      const groupMap = new Map<string, MatchGroup>();
      for (const fm of featuredMs) {
        const match = matchMap.get(fm.matchId);
        if (!match) continue;
        const key = `${fm.category}::${fm.categoryLabel}`;
        if (!groupMap.has(key)) {
          groupMap.set(key, { label: fm.categoryLabel, emoji: fm.categoryEmoji, matches: [] });
        }
        groupMap.get(key)!.matches.push(match);
      }
      matchGroups = [...groupMap.values()];
    } else {
      // Auto-generated groups
      matchGroups = [
        ...(data.topMatchElo.length > 0
          ? [{ label: "Nejvyšší ELO", emoji: "⭐", matches: data.topMatchElo }]
          : []),
        ...(data.topMatchDiff.length > 0
          ? [{ label: "Největší rozdíl ELO", emoji: "⚡", matches: data.topMatchDiff }]
          : []),
      ];
    }

    return NextResponse.json({
      ...data,
      milestones,
      matchGroups,
      // keep legacy fields for backward compat
      topMatchElo: data.topMatchElo,
      topMatchDiff: data.topMatchDiff,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { stats: {}, players: [], topMatchElo: [], topMatchDiff: [], milestones: [], matchGroups: [] },
      { status: 200 }
    );
  }
}
