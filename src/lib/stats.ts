import type { PlayerStanding, SummaryStats } from '@/types/dc';

function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  return Math.round(sorted[mid]);
}

/**
 * NOTE:
 * These are *placeholder* summary computations based solely on the standings sheet.
 * Once match-history is wired, we can compute true activity (7d/30d), deltas, upsets, etc.
 */
export function computeSummary(players: PlayerStanding[]): SummaryStats {
  const ratings = players.map((p) => p.rating).filter((n) => Number.isFinite(n));
  const totalGames = players.reduce((acc, p) => acc + (p.games || 0), 0);

  return {
    medianElo: median(ratings),
    totalGames,
    uniquePlayers: players.length,

    // placeholders until match history exists
    active7d: 0,
    active30d: 0,
    new30d: 0,
    matchesWeek: 0,
    matchesMonth: 0,
    avgDeltaEloPerMatch: 0,
    upsetPercent: 0,
  };
}

export function makeRatingHistogram(players: PlayerStanding[], bucketSize = 50) {
  const ratings = players.map((p) => p.rating).filter((n) => Number.isFinite(n) && n > 0);
  if (!ratings.length) return [] as { bucket: string; count: number }[];

  const min = Math.min(...ratings);
  const max = Math.max(...ratings);
  const start = Math.floor(min / bucketSize) * bucketSize;
  const end = Math.ceil(max / bucketSize) * bucketSize;

  const buckets = new Map<number, number>();
  for (let v = start; v <= end; v += bucketSize) buckets.set(v, 0);

  for (const r of ratings) {
    const key = Math.floor(r / bucketSize) * bucketSize;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return Array.from(buckets.entries()).map(([k, count]) => ({
    bucket: `${k}–${k + bucketSize - 1}`,
    count,
  }));
}

export function makeWinrateScatter(players: PlayerStanding[]) {
  return players
    .filter((p) => p.rating > 0 && p.games > 0)
    .map((p) => ({
      elo: p.rating,
      winrate: p.winrate,
      name: p.name,
    }));
}
