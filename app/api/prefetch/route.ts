import { NextRequest, NextResponse } from "next/server";
import { fetchDashboardData, fetchRecentMatches, fetchStandingsPlayers } from "@/lib/sheets";
import { getVisibleMilestones, getFeaturedMatches } from "@/lib/pinned";
import { getNameFilter } from "@/lib/regionFilter";
import { cacheGet, cacheSet, prefetchKey, snapshotGet, snapshotKey } from "@/lib/kvCache";
import type { InterestingMatch, DashboardData } from "@/lib/sheets";

interface MatchGroup { label: string; emoji: string; matches: InterestingMatch[]; }

export async function GET(req: NextRequest) {
  const mode   = (req.nextUrl.searchParams.get("mode") ?? "ELO") as "ELO" | "DCPR";
  const region = req.nextUrl.searchParams.get("region") ?? "ALL";

  // 1. Short-lived KV cache (10 min) — fastest path for repeat requests
  const shortKey = prefetchKey(mode, region);
  const cached   = await cacheGet<unknown>(shortKey);
  if (cached) return NextResponse.json(cached);

  try {
    // 2. Build from snapshots if available (no Google Sheets call needed)
    const [snapPlayers, snapDash, snapRecent] = await Promise.all([
      snapshotGet<ReturnType<typeof Array>>(snapshotKey("players",       mode, region)),
      snapshotGet<DashboardData>           (snapshotKey("dashboard-data", mode, region)),
      snapshotGet<InterestingMatch[]>      ("snapshot:v1:recent-matches"),
    ]);

    const players = snapPlayers
      ?? await (async () => { const nf = await getNameFilter(region, mode); return fetchStandingsPlayers(mode, nf); })();

    const dashData = snapDash
      ?? await (async () => { const nf = await getNameFilter(region, mode); return fetchDashboardData(mode, nf); })();

    const [pinnedMs, featuredMs] = await Promise.all([
      getVisibleMilestones(region),
      getFeaturedMatches(region),
    ]);

    const milestones = pinnedMs.length > 0
      ? pinnedMs.map(m => ({ icon: m.icon, text: m.text, date: m.date, cat: m.cat }))
      : dashData.milestones;

    let matchGroups: MatchGroup[];
    if (featuredMs.length > 0) {
      const allRecent = snapRecent ?? await fetchRecentMatches(90);
      const matchMap  = new Map(allRecent.map(m => [m.matchId, m]));
      const groupMap  = new Map<string, MatchGroup>();
      for (const fm of featuredMs) {
        const match = matchMap.get(fm.matchId);
        if (!match) continue;
        const gkey = `${fm.category}::${fm.categoryLabel}`;
        if (!groupMap.has(gkey)) groupMap.set(gkey, { label: fm.categoryLabel, emoji: fm.categoryEmoji, matches: [] });
        groupMap.get(gkey)!.matches.push(match);
      }
      matchGroups = [...groupMap.values()];
    } else {
      matchGroups = [
        ...(dashData.topMatchElo.length  > 0 ? [{ label: "Nejvyšší ELO",       emoji: "⭐", matches: dashData.topMatchElo  }] : []),
        ...(dashData.topMatchDiff.length > 0 ? [{ label: "Největší rozdíl ELO", emoji: "⚡", matches: dashData.topMatchDiff }] : []),
      ];
    }

    const dashboard = { ...dashData, milestones, matchGroups, topMatchElo: dashData.topMatchElo, topMatchDiff: dashData.topMatchDiff };
    const result    = { dashboard, players };

    // Cache for 10 min (so rapid client re-requests are fast)
    await cacheSet(shortKey, result, 600);

    return NextResponse.json(result);
  } catch (e) {
    console.error("[prefetch]", e);
    return NextResponse.json({ dashboard: {}, players: [] }, { status: 200 });
  }
}
