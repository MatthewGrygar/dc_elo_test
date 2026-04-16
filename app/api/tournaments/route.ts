import { NextRequest, NextResponse } from "next/server";

const SHEET_ID = "1y98bzsIRpVv0_cGNfbITapucO5A6izeEz5lTM92ZbIA";

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    const row: string[] = []; let inQ = false, cur = "";
    for (const ch of line) {
      if (ch === '"') inQ = !inQ;
      else if (ch === "," && !inQ) { row.push(cur.trim()); cur = ""; }
      else cur += ch;
    }
    row.push(cur.trim()); rows.push(row);
  }
  return rows;
}

async function fetchSheet(name: string): Promise<string[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return parseCSV(await res.text());
  } catch { return []; }
}

const pf = (s: string) => { const n = parseFloat((s ?? "").replace(/[^0-9.\-]/g, "")); return isNaN(n) ? 0 : n; };

function parseDate(s: string): Date | null {
  if (!s) return null;
  s = s.trim();
  if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(s)) {
    const p = s.split(".");
    const d = new Date(+p[2], +p[1] - 1, +p[0]);
    if (!isNaN(d.getTime())) return d;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const iso = new Date(s + "T00:00:00");
    if (!isNaN(iso.getTime())) return iso;
  }
  return null;
}

type GameResult = "Won" | "Lost" | "Draw";

function toResult(s: string): GameResult {
  if (s.startsWith("Won")) return "Won";
  if (s.startsWith("Lost")) return "Lost";
  return "Draw";
}

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("mode") ?? "ELO";
  const sheetName = mode === "DCPR" ? "Player cards (CSV) - Tournament" : "Player cards (CSV)";

  const rows = await fetchSheet(sheetName);
  const data = rows.slice(1).filter(r => r[0]?.trim());

  // Group rows by matchId
  const matchMap = new Map<string, string[][]>();
  for (const r of data) {
    const mid = r[1]?.trim();
    if (!mid) continue;
    if (!matchMap.has(mid)) matchMap.set(mid, []);
    matchMap.get(mid)!.push(r);
  }

  // Group by tournament name
  const tournMap = new Map<string, {
    name: string; type: string; dateTs: number; dates: string[];
    games: {
      matchId: string; date: string;
      player1: string; elo1Before: number; elo1After: number; delta1: number; result1: GameResult;
      player2: string; elo2Before: number; elo2After: number; delta2: number; result2: GameResult;
    }[];
  }>();

  for (const [matchId, mrows] of matchMap) {
    if (mrows.length < 2) continue;
    const [r1, r2] = mrows;

    const tType = r1[2]?.trim() ?? "";
    const tournName = tType === "FNM"
      ? `${r1[3]?.trim() ?? ""} ${r1[4]?.trim() ?? ""}`.trim()
      : r1[3]?.trim() ?? "";
    if (!tournName) continue;

    const date = r1[4]?.trim() ?? "";
    const dateTs = parseDate(date)?.getTime() ?? 0;

    const delta1 = pf(r1[7]);
    const elo1After = Math.round(pf(r1[8]));
    const elo1Before = Math.round(elo1After - delta1);

    const delta2 = pf(r2[7]);
    const elo2After = Math.round(pf(r2[8]));
    const elo2Before = Math.round(elo2After - delta2);

    const game = {
      matchId,
      date,
      player1: r1[0]?.trim() ?? "",
      elo1Before,
      elo1After,
      delta1: Math.round(delta1),
      result1: toResult(r1[6]?.trim() ?? ""),
      player2: r2[0]?.trim() ?? "",
      elo2Before,
      elo2After,
      delta2: Math.round(delta2),
      result2: toResult(r2[6]?.trim() ?? ""),
    };

    if (!tournMap.has(tournName)) {
      tournMap.set(tournName, { name: tournName, type: tType, dateTs: 0, dates: [], games: [] });
    }
    const t = tournMap.get(tournName)!;
    t.dates.push(date);
    if (dateTs > t.dateTs) t.dateTs = dateTs;
    t.games.push(game);
  }

  const tournaments = [...tournMap.values()]
    .map(t => ({
      name: t.name,
      type: t.type,
      date: t.dates.sort((a, b) => (parseDate(b)?.getTime() ?? 0) - (parseDate(a)?.getTime() ?? 0))[0] ?? "",
      gameCount: t.games.length,
      games: t.games.sort((a, b) => (parseDate(b.date)?.getTime() ?? 0) - (parseDate(a.date)?.getTime() ?? 0)),
    }))
    .sort((a, b) => (parseDate(b.date)?.getTime() ?? 0) - (parseDate(a.date)?.getTime() ?? 0));

  return NextResponse.json(tournaments, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
