import { NextRequest, NextResponse } from "next/server";
import { fetchStandingsPlayers, fetchDashboardData, fetchDashboardStats, fetchRecentMatches, fetchFRPlayerNames } from "@/lib/sheets";
import { fetchAnalyticsData, fetchGeneralStats, fetchRecords } from "@/lib/dataFetchers";
import { snapshotGet, snapshotSet, snapshotKey, snapshotKeyMeta, SNAPSHOT_TTL } from "@/lib/kvCache";
import { cacheSet } from "@/lib/kvCache";

// Allow up to 60s on Vercel Pro/Enterprise; falls back gracefully on Hobby (10s)
export const maxDuration = 60;

const MODES   = ["ELO", "DCPR"] as const;
const REGIONS = ["ALL", "CZ", "FR"] as const;

type Mode   = typeof MODES[number];
type Region = typeof REGIONS[number];

function makeFilter(region: Region, mode: Mode, frNames: Set<string>) {
  if (region === "ALL") return undefined;
  if (mode === "DCPR") {
    if (region === "FR") return () => false;
    return undefined;
  }
  if (region === "FR") return (n: string) => frNames.has(n);
  return (n: string) => !frNames.has(n);
}

// ── GET — return last sync status ────────────────────────────────────────────
export async function GET() {
  const meta = await snapshotGet<{ status: string; syncedAt: string | null; count: number }>(snapshotKeyMeta());
  return NextResponse.json(meta ?? { status: "never", syncedAt: null, count: 0 });
}

// ── POST — run full sync ─────────────────────────────────────────────────────
export async function POST() {
  await snapshotSet(snapshotKeyMeta(), { status: "syncing", syncedAt: null, startedAt: new Date().toISOString(), count: 0 });

  let count = 0;

  try {
    // 1. Fetch FR player names once — needed for region filtering
    const frNames = await fetchFRPlayerNames();
    await snapshotSet("snapshot:v1:fr-players", [...frNames]);
    count++;

    // 2. Recent matches (used by dashboard featured-match logic)
    const recentMatches = await fetchRecentMatches(90);
    await snapshotSet("snapshot:v1:recent-matches", recentMatches);
    count++;

    // 3. Stats (not region-filtered — per mode only)
    await Promise.all(MODES.map(async (mode) => {
      const stats = await fetchDashboardStats(mode);
      await snapshotSet(`snapshot:v1:stats:${mode}`, stats);
      count++;
    }));

    // 4. All mode × region combinations in parallel
    await Promise.all(
      MODES.flatMap(mode =>
        REGIONS.map(async (region) => {
          const nf = makeFilter(region, mode, frNames);

          const [players, dashData, analytics, generalStats, records] = await Promise.all([
            fetchStandingsPlayers(mode, nf),
            fetchDashboardData(mode, nf),
            fetchAnalyticsData(mode, nf),
            fetchGeneralStats(mode, nf),
            fetchRecords(mode, nf),
          ]);

          await Promise.all([
            snapshotSet(snapshotKey("players",       mode, region), players),
            snapshotSet(snapshotKey("dashboard-data", mode, region), dashData),
            snapshotSet(snapshotKey("analytics",      mode, region), analytics),
            snapshotSet(snapshotKey("general-stats",  mode, region), generalStats),
            snapshotSet(snapshotKey("records",        mode, region), records),
          ]);

          count += 5;
        })
      )
    );

    // 5. Invalidate short-lived prefetch caches so clients re-hydrate from fresh snapshots
    await Promise.all(
      MODES.flatMap(mode =>
        REGIONS.map(region => cacheSet(`cache:prefetch:${mode}:${region}`, null, 1))
      )
    );

    const meta = { status: "ok", syncedAt: new Date().toISOString(), count };
    await snapshotSet(snapshotKeyMeta(), meta);
    return NextResponse.json({ ok: true, ...meta });

  } catch (e) {
    console.error("[sync]", e);
    await snapshotSet(snapshotKeyMeta(), {
      status: "error",
      syncedAt: null,
      errorAt: new Date().toISOString(),
      error: String(e),
    });
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
