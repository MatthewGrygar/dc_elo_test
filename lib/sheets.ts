// ─────────────────────────────────────────────────────────────────────────────
// Google Sheets data layer — DC ELO
// Sheet ID: 1y98bzsIRpVv0_cGNfbITapucO5A6izeEz5lTM92ZbIA
//
// DATA MAP
//  ELO standings   → "Elo standings"           A=name B=rating C=games D=win E=loss F=draw G=winrate H=peak
//  ELO cards       → "Player cards (CSV)"       A=player B=matchId C=tourn D=tourn_detail E=date F=opp(rating) G=result H=+- I=elo
//  DCPR standings  → "Tournament_Elo"           same columns as ELO standings  + I=VT class
//  DCPR cards      → "Player cards (CSV) - Tournament"  same columns as ELO cards
//  Shared data     → "Data"                     B3+ = tournament names/IDs
// ─────────────────────────────────────────────────────────────────────────────

export interface Player {
  id: number;
  name: string;
  rating: number;
  games: number;
  win: number;
  loss: number;
  draw: number;
  peak: number;
  winrate: number;         // 0-1
  vtClass?: VTClass;       // from Tournament_Elo col I
}

export type VTClass = "VT1" | "VT2" | "VT3" | "VT4";

export interface DashboardStats {
  totalGames: number;
  uniquePlayers: number;
  medianElo: number;
  uniqueTournaments: number;
  lastDataEntry: string;   // last value in Data!B
}

export interface InterestingMatch {
  matchId: string;
  player1: string;
  elo1: number;
  result1: string;        // e.g. "Won 2-0"
  player2: string;
  elo2: number;
  result2: string;
  avgElo: number;
  eloDiff: number;
  date: string;
}

export interface DashboardData {
  stats: DashboardStats;
  players: Player[];          // top 5 for hero panel (from standings)
  topMatchElo: InterestingMatch[];    // 2 highest avg elo matches
  topMatchDiff: InterestingMatch[];   // 2 biggest elo diff matches
  milestones: { icon: string; text: string; date: string; cat: string }[];
}

// ─── helpers ─────────────────────────────────────────────────────────────────

const SHEET_ID = "1y98bzsIRpVv0_cGNfbITapucO5A6izeEz5lTM92ZbIA";

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split("\n");
  for (const line of lines) {
    if (!line.trim()) continue;
    const row: string[] = [];
    let inQ = false, cur = "";
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === "," && !inQ) { row.push(cur.trim()); cur = ""; }
      else cur += ch;
    }
    row.push(cur.trim());
    rows.push(row);
  }
  return rows;
}

async function fetchSheetByName(name: string): Promise<string[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parseCSV(await res.text());
  } catch (e) {
    console.error("fetchSheet failed:", name, e);
    return [];
  }
}

function pf(s: string): number {
  if (!s) return 0;
  const n = parseFloat(s.replace(/[^0-9.\-]/g, ""));
  return isNaN(n) ? 0 : n;
}

function pi(s: string): number { return Math.round(pf(s)); }

function parseDate(s: string): Date | null {
  if (!s) return null;
  const iso = new Date(s);
  if (!isNaN(iso.getTime())) return iso;
  const p = s.split(".");
  if (p.length === 3) {
    const d = new Date(+p[2], +p[1] - 1, +p[0]);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

// Extract opponent name from "Name Surname (1500)" format
function parseOpponentName(s: string): string {
  const m = s.match(/^(.+?)\s*\(\d+\)/);
  return m ? m[1].trim() : s.trim();
}

function parseOpponentRating(s: string): number {
  const m = s.match(/\((\d+)\)/);
  return m ? parseInt(m[1]) : 0;
}

// ─── VT class lookup from Tournament_Elo col I ───────────────────────────────

let vtClassCache: Map<string, VTClass> | null = null;

async function getVtClassMap(): Promise<Map<string, VTClass>> {
  if (vtClassCache) return vtClassCache;
  const rows = await fetchSheetByName("Tournament_Elo");
  const map = new Map<string, VTClass>();
  for (let i = 1; i < rows.length; i++) {
    const name = rows[i][0]?.trim();
    const vt = rows[i][8]?.trim() as VTClass; // col I = index 8
    if (name && vt) map.set(name, vt);
  }
  vtClassCache = map;
  return map;
}

// ─── Public: standings players ───────────────────────────────────────────────

export async function fetchStandingsPlayers(mode: "ELO" | "DCPR"): Promise<Player[]> {
  const sheetName = mode === "ELO" ? "Elo standings" : "Tournament_Elo";
  const [rows, vtMap] = await Promise.all([
    fetchSheetByName(sheetName),
    getVtClassMap(),
  ]);

  const players: Player[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = row[0]?.trim();
    if (!name) continue;

    const rating = pf(row[1]);
    const games  = pi(row[2]);
    const win    = pi(row[3]);
    const loss   = pi(row[4]);
    const draw   = pi(row[5]);
    const wrRaw  = pf(row[6]);
    const peak   = pf(row[7]);
    const winrate = wrRaw > 1 ? wrRaw / 100 : wrRaw;
    const vtClass = mode === "DCPR"
      ? (row[8]?.trim() as VTClass | undefined)
      : vtMap.get(name);

    players.push({ id: i, name, rating, games, win, loss, draw, peak, winrate, vtClass });
  }

  return players
    .sort((a, b) => b.rating - a.rating)
    .map((p, idx) => ({ ...p, id: idx + 1 }));
}

// ─── Public: dashboard data (stats + top5 + interesting matches) ─────────────

export async function fetchDashboardData(mode: "ELO" | "DCPR"): Promise<DashboardData> {
  const standingsSheet   = mode === "ELO" ? "Elo standings" : "Tournament_Elo";
  const cardsSheetElo    = "Player cards (CSV)";
  const cardsSheetDcpr   = "Player cards (CSV) - Tournament";

  const [standings, cardsElo, cardsDcpr, dataSheet] = await Promise.all([
    fetchSheetByName(standingsSheet),
    fetchSheetByName(cardsSheetElo),
    fetchSheetByName(cardsSheetDcpr),
    fetchSheetByName("Data"),
  ]);

  // ── KPI 1: Total games = sum(col C) / 2
  let gamesSum = 0;
  for (let i = 1; i < standings.length; i++) {
    if (standings[i][0]?.trim()) gamesSum += pi(standings[i][2]);
  }
  const totalGames = Math.round(gamesSum / 2);

  // ── KPI 2: Unique players
  const playerSet = new Set<string>();
  for (let i = 1; i < standings.length; i++) {
    const n = standings[i][0]?.trim();
    if (n) playerSet.add(n);
  }
  const uniquePlayers = playerSet.size;

  // ── KPI 3: Median ELO
  const ratings: number[] = [];
  for (let i = 1; i < standings.length; i++) {
    if (standings[i][0]?.trim()) {
      const r = pf(standings[i][1]);
      if (r > 0) ratings.push(r);
    }
  }
  ratings.sort((a, b) => a - b);
  const mid = Math.floor(ratings.length / 2);
  const medianElo = ratings.length === 0 ? 1200
    : ratings.length % 2 === 0 ? (ratings[mid - 1] + ratings[mid]) / 2
    : ratings[mid];

  // ── KPI 4: Tournaments — count records in Data!B from B3 down
  let uniqueTournaments = 0;
  let lastDataEntry = "—";
  if (dataSheet.length > 2) {
    for (let i = 2; i < dataSheet.length; i++) {
      const v = dataSheet[i][1]?.trim();
      if (v) { uniqueTournaments++; lastDataEntry = v; }
    }
  }

  // ── Top 5 players for hero panel
  const vtMap = await getVtClassMap();
  const top5: Player[] = [];
  for (let i = 1; i <= 5 && i < standings.length; i++) {
    const row = standings[i];
    const name = row[0]?.trim();
    if (!name) continue;
    const wrRaw = pf(row[6]);
    top5.push({
      id: i,
      name,
      rating: pf(row[1]),
      games:  pi(row[2]),
      win:    pi(row[3]),
      loss:   pi(row[4]),
      draw:   pi(row[5]),
      winrate: wrRaw > 1 ? wrRaw / 100 : wrRaw,
      peak:   pf(row[7]),
      vtClass: vtMap.get(name),
    });
  }

  // ── Interesting matches (last 30 days, both sheets combined)
  const now = new Date();
  const ago30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  interface CardRow {
    player: string; matchId: string; date: string;
    opponent: string; oppRating: number;
    result: string; eloChange: number; elo: number;
  }

  function parseCards(rows: string[][]): CardRow[] {
    const out: CardRow[] = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const player = r[0]?.trim();
      if (!player) continue;
      const d = parseDate(r[4]);
      if (!d || d < ago30) continue;
      out.push({
        player,
        matchId: r[1]?.trim(),
        date: r[4]?.trim(),
        opponent: parseOpponentName(r[5] ?? ""),
        oppRating: parseOpponentRating(r[5] ?? ""),
        result: r[6]?.trim(),
        eloChange: pf(r[7]),
        elo: pf(r[8]),
      });
    }
    return out;
  }

  const allCards = [...parseCards(cardsElo), ...parseCards(cardsDcpr)];

  // Group by matchId — find pairs
  const byMatch = new Map<string, CardRow[]>();
  for (const c of allCards) {
    if (!byMatch.has(c.matchId)) byMatch.set(c.matchId, []);
    byMatch.get(c.matchId)!.push(c);
  }

  const matchPairs: InterestingMatch[] = [];
  for (const [matchId, rows] of byMatch) {
    if (rows.length < 2) continue;
    const a = rows[0], b = rows[1];
    const elo1 = a.elo - a.eloChange;  // elo before the game
    const elo2 = b.elo - b.eloChange;
    const avgElo = (elo1 + elo2) / 2;
    const eloDiff = Math.abs(elo1 - elo2);
    matchPairs.push({
      matchId, player1: a.player, elo1: Math.round(elo1),
      result1: a.result, player2: b.player, elo2: Math.round(elo2),
      result2: b.result, avgElo, eloDiff, date: a.date,
    });
  }

  // Helper: pick 2 with unique names
  function pickUnique(sorted: InterestingMatch[]): InterestingMatch[] {
    const usedNames = new Set<string>();
    const picked: InterestingMatch[] = [];
    for (const m of sorted) {
      if (usedNames.has(m.player1) || usedNames.has(m.player2)) continue;
      picked.push(m);
      usedNames.add(m.player1);
      usedNames.add(m.player2);
      if (picked.length === 2) break;
    }
    return picked;
  }

  const byAvgElo = [...matchPairs].sort((a, b) => b.avgElo - a.avgElo);
  const byDiff   = [...matchPairs].sort((a, b) => b.eloDiff - a.eloDiff);

  const topMatchElo  = pickUnique(byAvgElo);
  const topMatchDiff = pickUnique(byDiff);

  // ── Live milestones ────────────────────────────────────────────────────────
  const milestones: { icon: string; text: string; date: string; cat: string }[] = [];
  const fmtD = (d: string) => d || "—";

  // 1. Current #1
  const currentFirst = standings[1]?.[0]?.trim();
  if (currentFirst) milestones.push({ icon: "🏆", text: `#1 žebříčku: ${currentFirst}`, date: "aktuálně", cat: "Žebříček" });

  // 2. Biggest recent gain (7d) across both card sheets
  const ago7 = new Date(Date.now() - 7 * 86400_000);
  const gain7 = new Map<string, { sum: number; date: string }>();
  for (const r of [...cardsElo, ...cardsDcpr]) {
    const d = parseDate(r[4]); if (!d || d < ago7) continue;
    const n = r[0]?.trim(); if (!n) continue;
    const ch = pf(r[7]);
    const prev = gain7.get(n) ?? { sum: 0, date: r[4]?.trim() };
    gain7.set(n, { sum: prev.sum + ch, date: r[4]?.trim() ?? prev.date });
  }
  let topGainName = "", topGainVal = -Infinity, topGainDate = "";
  for (const [n, v] of gain7) if (v.sum > topGainVal) { topGainVal = v.sum; topGainName = n; topGainDate = v.date; }
  if (topGainName && topGainVal > 0) milestones.push({ icon: "📈", text: `Největší zisk (7 dní): ${topGainName} +${Math.round(topGainVal)}`, date: fmtD(topGainDate), cat: "ELO" });

  // 3. Biggest recent loss (7d)
  let topLossName = "", topLossVal = Infinity, topLossDate = "";
  for (const [n, v] of gain7) if (v.sum < topLossVal) { topLossVal = v.sum; topLossName = n; topLossDate = v.date; }
  if (topLossName && topLossVal < 0) milestones.push({ icon: "📉", text: `Největší propad (7 dní): ${topLossName} ${Math.round(topLossVal)}`, date: fmtD(topLossDate), cat: "ELO" });

  // 4. Best upset (30d) — biggest elo diff win
  let upsWinner = "", upsLoser = "", upsDiff = 0, upsDate = "";
  for (const r of [...cardsElo, ...cardsDcpr]) {
    const d = parseDate(r[4]); if (!d || d < ago30) continue;
    const res = r[6]?.trim() ?? "";
    if (!res.startsWith("Won")) continue;
    const delta = pf(r[7]), elo = pf(r[8]), myE = elo - delta;
    const m = r[5]?.match(/\((\d+)\)/); if (!m) continue;
    const oe = parseInt(m[1]);
    if (oe - myE > upsDiff) { upsDiff = oe - myE; upsWinner = r[0]?.trim(); upsLoser = parseOpponentName(r[5] ?? ""); upsDate = r[4]?.trim(); }
  }
  if (upsWinner) milestones.push({ icon: "⚡", text: `Upset: ${upsWinner} porazil ${upsLoser} (rozdíl ${Math.round(upsDiff)})`, date: fmtD(upsDate), cat: "Upset" });

  // 5. Active win streak leader (both sheets combined)
  const streaks = new Map<string, number>();
  const allCardsSorted = [...cardsElo, ...cardsDcpr]
    .filter(r => r[0]?.trim() && r[4]?.trim())
    .sort((a, b) => (parseDate(a[4])?.getTime() ?? 0) - (parseDate(b[4])?.getTime() ?? 0));
  for (const r of allCardsSorted) {
    const n = r[0]?.trim(); if (!n) continue;
    const res = r[6]?.trim() ?? "";
    if (res.startsWith("Won")) streaks.set(n, (streaks.get(n) ?? 0) + 1);
    else streaks.set(n, 0);
  }
  let streakLeader = "", streakLen = 0;
  for (const [n, s] of streaks) if (s > streakLen) { streakLen = s; streakLeader = n; }
  if (streakLeader && streakLen >= 3) milestones.push({ icon: "🔥", text: `Aktivní série: ${streakLeader} — ${streakLen}× výher v řadě`, date: "aktuálně", cat: "Série" });

  return {
    stats: {
      totalGames,
      uniquePlayers,
      medianElo: Math.round(medianElo),
      uniqueTournaments,
      lastDataEntry,
    },
    players: top5,
    topMatchElo,
    topMatchDiff,
    milestones,
  };
}

// Extended stats for the /api/stats route (used by StatisticsView)
export interface ExtendedDashboardStats {
  totalGames: number;
  uniquePlayers: number;
  medianElo: number;
  uniqueTournaments: number;
  lastDataEntry: string;
  // extras for StatisticsView
  activePlayers30d: number;
  gamesLast30d: number;
  newPlayers30d: number;
  avgEloChange: number;
}

export async function fetchDashboardStats(mode: "ELO" | "DCPR"): Promise<ExtendedDashboardStats> {
  const data = await fetchDashboardData(mode);
  const standingsSheet = mode === "ELO" ? "Elo standings" : "Tournament_Elo";
  const cardsSheet     = mode === "ELO" ? "Player cards (CSV)" : "Player cards (CSV) - Tournament";
  const [cards] = await Promise.all([fetchSheetByName(cardsSheet)]);

  const now = new Date();
  const ago30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const activePlayers30dSet = new Set<string>();
  const games30dSet = new Set<string>();
  let totalEloChange = 0, eloChangeCount = 0;
  const firstSeenMap = new Map<string, Date>();

  for (let i = 1; i < cards.length; i++) {
    const r = cards[i];
    const name = r[0]?.trim();
    const gameId = r[1]?.trim();
    if (!name) continue;
    const d = parseDate(r[4]);
    if (d) {
      if (d >= ago30) { activePlayers30dSet.add(name); if (gameId) games30dSet.add(gameId); }
      const ex = firstSeenMap.get(name);
      if (!ex || d < ex) firstSeenMap.set(name, d);
    }
    const ch = pf(r[7]);
    if (ch !== 0) { totalEloChange += Math.abs(ch); eloChangeCount++; }
  }

  let newPlayers30d = 0;
  for (const [, d] of firstSeenMap) if (d >= ago30) newPlayers30d++;

  return {
    ...data.stats,
    activePlayers30d: activePlayers30dSet.size || data.stats.uniquePlayers,
    gamesLast30d: games30dSet.size,
    newPlayers30d,
    avgEloChange: eloChangeCount > 0 ? Math.round((totalEloChange / eloChangeCount) * 10) / 10 : 0,
  };
}

// ─── Public: all recent match pairs (for admin match selection) ───────────────

export async function fetchRecentMatches(days = 60): Promise<InterestingMatch[]> {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [cardsElo, cardsDcpr] = await Promise.all([
    fetchSheetByName("Player cards (CSV)"),
    fetchSheetByName("Player cards (CSV) - Tournament"),
  ]);

  interface CardRow {
    player: string; matchId: string; date: string;
    result: string; eloChange: number; elo: number;
  }

  function parseCards(rows: string[][]): CardRow[] {
    const out: CardRow[] = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const player = r[0]?.trim();
      if (!player) continue;
      const d = parseDate(r[4]);
      if (!d || d < cutoff) continue;
      out.push({
        player,
        matchId: r[1]?.trim(),
        date: r[4]?.trim(),
        result: r[6]?.trim(),
        eloChange: pf(r[7]),
        elo: pf(r[8]),
      });
    }
    return out;
  }

  const allCards = [...parseCards(cardsElo), ...parseCards(cardsDcpr)];

  const byMatch = new Map<string, CardRow[]>();
  for (const c of allCards) {
    if (!byMatch.has(c.matchId)) byMatch.set(c.matchId, []);
    byMatch.get(c.matchId)!.push(c);
  }

  const pairs: InterestingMatch[] = [];
  for (const [matchId, rows] of byMatch) {
    if (rows.length < 2) continue;
    const a = rows[0], b = rows[1];
    const elo1 = a.elo - a.eloChange;
    const elo2 = b.elo - b.eloChange;
    pairs.push({
      matchId,
      player1: a.player, elo1: Math.round(elo1), result1: a.result,
      player2: b.player, elo2: Math.round(elo2), result2: b.result,
      avgElo: (elo1 + elo2) / 2,
      eloDiff: Math.abs(elo1 - elo2),
      date: a.date,
    });
  }

  // Sort by date descending
  return pairs.sort((a, b) => {
    const da = parseDate(a.date), db = parseDate(b.date);
    if (!da || !db) return 0;
    return db.getTime() - da.getTime();
  });
}
