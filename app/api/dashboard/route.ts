import { NextResponse } from "next/server";
import { fetchDashboardData, fetchRecentMatches, type InterestingMatch } from "@/lib/sheets";
import { getVisibleMilestones, getFeaturedMatches } from "@/lib/pinned";
import { getNameFilter } from "@/lib/regionFilter";
import { snapshotGet, snapshotKey } from "@/lib/kvCache";
import type { DashboardData } from "@/lib/sheets";

export interface MatchGroup {
  label: string;
  emoji: string;
  matches: InterestingMatch[];
}

async function buildResponse(mode: string, region: string, data: DashboardData, recentMatchesFn: () => Promise<InterestingMatch[]>) {
  const [pinnedMs, featuredMs] = await Promise.all([
    getVisibleMilestones(region),
    getFeaturedMatches(region),
  ]);

  const milestones = pinnedMs.length > 0
    ? pinnedMs.map((m) => ({ icon: m.icon, text: m.text, date: m.date, cat: m.cat }))
    : data.milestones;

  let matchGroups: MatchGroup[];
  if (featuredMs.length > 0) {
    const allRecent = await recentMatchesFn();
    const matchMap  = new Map(allRecent.map((m) => [m.matchId, m]));
    const groupMap  = new Map<string, MatchGroup>();
    for (const fm of featuredMs) {
      const match = matchMap.get(fm.matchId);
      if (!match) continue;
      const key = `${fm.category}::${fm.categoryLabel}`;
      if (!groupMap.has(key)) groupMap.set(key, { label: fm.categoryLabel, emoji: fm.categoryEmoji, matches: [] });
      groupMap.get(key)!.matches.push(match);
    }
    matchGroups = [...groupMap.values()];
  } else {
    matchGroups = [
      ...(data.topMatchElo.length  > 0 ? [{ label: "Nejvyšší ELO",       emoji: "⭐", matches: data.topMatchElo  }] : []),
      ...(data.topMatchDiff.length > 0 ? [{ label: "Největší rozdíl ELO", emoji: "⚡", matches: data.topMatchDiff }] : []),
    ];
  }

  return { ...data, milestones, matchGroups, topMatchElo: data.topMatchElo, topMatchDiff: data.topMatchDiff };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode   = searchParams.get("mode") === "DCPR" ? "DCPR" : "ELO";
  const region = searchParams.get("region") ?? "ALL";

  try {
    // Try snapshot for the Sheets data (expensive part)
    const snapData = await snapshotGet<DashboardData>(snapshotKey("dashboard-data", mode, region));
    const snapRecent = await snapshotGet<InterestingMatch[]>("snapshot:v1:recent-matches");

    const data = snapData ?? await (async () => {
      const nameFilter = await getNameFilter(region, mode);
      return fetchDashboardData(mode, nameFilter);
    })();

    const getRecent = snapRecent
      ? () => Promise.resolve(snapRecent)
      : () => fetchRecentMatches(90);

    const result = await buildResponse(mode, region, data, getRecent);
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { stats: {}, players: [], topMatchElo: [], topMatchDiff: [], milestones: [], matchGroups: [] },
      { status: 200 }
    );
  }
}
