import { NextRequest, NextResponse } from "next/server";
import { fetchDashboardData, fetchRecentMatches, fetchStandingsPlayers } from "@/lib/sheets";
import { fetchGeneralStats, fetchAnalyticsData, fetchRecords } from "@/lib/dataFetchers";
import { getVisibleMilestones, getFeaturedMatches, getRecordOverrides } from "@/lib/pinned";
import { getNameFilter } from "@/lib/regionFilter";
import { cacheGet, cacheSet, prefetchKey } from "@/lib/kvCache";
import type { InterestingMatch } from "@/lib/sheets";

interface MatchGroup {
  label: string;
  emoji: string;
  matches: InterestingMatch[];
}

export async function GET(req: NextRequest) {
  const mode   = (req.nextUrl.searchParams.get("mode") ?? "ELO") as "ELO" | "DCPR";
  const region = req.nextUrl.searchParams.get("region") ?? "ALL";

  // KV cache hit
  const key    = prefetchKey(mode, region);
  const cached = await cacheGet<unknown>(key);
  if (cached) return NextResponse.json(cached);

  try {
    const nameFilter = await getNameFilter(region, mode);

    const [dashData, players, stats, analytics, recordsRaw, pinnedMs, featuredMs, overrides] =
      await Promise.all([
        fetchDashboardData(mode, nameFilter),
        fetchStandingsPlayers(mode, nameFilter),
        fetchGeneralStats(mode, nameFilter),
        fetchAnalyticsData(mode, nameFilter),
        fetchRecords(mode, nameFilter),
        getVisibleMilestones(region),
        getFeaturedMatches(region),
        getRecordOverrides(),
      ]);

    // Apply record overrides
    const overrideMap = new Map(overrides.map(o => [o.key, o]));
    if (overrideMap.size > 0) {
      for (const cat of recordsRaw.categories) {
        for (const rec of cat.records) {
          const ov = overrideMap.get(`${cat.id}/${rec.label}`);
          if (ov && rec.entry) {
            rec.entry = {
              ...rec.entry,
              value: ov.value,
              ...(ov.player  !== undefined ? { player:  ov.player  } : {}),
              ...(ov.detail  !== undefined ? { detail:  ov.detail  } : {}),
              ...(ov.detail2 !== undefined ? { detail2: ov.detail2 } : {}),
            };
          }
        }
      }
    }

    // Build milestones
    const milestones = pinnedMs.length > 0
      ? pinnedMs.map(m => ({ icon: m.icon, text: m.text, date: m.date, cat: m.cat }))
      : dashData.milestones;

    // Build match groups
    let matchGroups: MatchGroup[];
    if (featuredMs.length > 0) {
      const allRecent = await fetchRecentMatches(90);
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

    const dashboard = {
      ...dashData,
      milestones,
      matchGroups,
      topMatchElo:  dashData.topMatchElo,
      topMatchDiff: dashData.topMatchDiff,
    };

    const result = { dashboard, players, stats, analytics, records: recordsRaw };

    // Cache for 10 minutes
    await cacheSet(key, result, 600);

    return NextResponse.json(result);
  } catch (e) {
    console.error("[prefetch]", e);
    return NextResponse.json(
      { dashboard: {}, players: [], stats: {}, analytics: {}, records: {} },
      { status: 200 }
    );
  }
}
