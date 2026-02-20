import { Player } from "../types/player";

/**
 * Google Sheet → data source
 *
 * We use the "gviz" endpoint because:
 * - it works without an API key for public sheets
 * - it's stable and returns structured cells
 *
 * Endpoint returns:
 *   google.visualization.Query.setResponse({...})
 * so we have to strip the wrapper and JSON.parse it.
 */
const SHEET_ID = "1y98bzsIRpVv0_cGNfbITapucO5A6izeEz5lTM92ZbIA";
const SHEET_NAME = "Elo standings";

// We select columns A–H (A,B,C,D,E,F,G,H) and skip header row.
const GVIZ_URL =
  "https://docs.google.com/spreadsheets/d/" +
  SHEET_ID +
  "/gviz/tq?sheet=" +
  encodeURIComponent(SHEET_NAME) +
  "&tq=" +
  encodeURIComponent("select A,B,C,D,E,F,G,H") +
  "&headers=1";

/** Best-effort number parsing (sheet cells may come as strings). */
function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const normalized = String(value).replace(",", ".").trim();
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

function unwrapGviz(text: string): any {
  // Typical payload: "/*O_o*/\\ngoogle.visualization.Query.setResponse({...});"
  const m = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);\s*$/);
  if (!m) throw new Error("Unexpected GVIZ payload");
  return JSON.parse(m[1]);
}

export async function fetchPlayersFromGoogleSheet(): Promise<Player[]> {
  const res = await fetch(GVIZ_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status} ${res.statusText}`);
  const text = await res.text();
  const json = unwrapGviz(text);

  const rows: any[] = json?.table?.rows ?? [];
  const players: Player[] = [];

  for (const r of rows) {
    const c = r?.c ?? [];
    const name = c[0]?.v ? String(c[0].v) : "";
    if (!name) continue;

    const rating = toNumber(c[1]?.v);
    const games = toNumber(c[2]?.v);
    const win = toNumber(c[3]?.v);
    const loss = toNumber(c[4]?.v);
    const draw = toNumber(c[5]?.v);
    const winrate = toNumber(c[6]?.v);
    const peak = toNumber(c[7]?.v);

    players.push({
      id: name, // placeholder; later can be stable ID column
      name,
      rating,
      games,
      win,
      loss,
      draw,
      winrate,
      peak,
    });
  }

  // Sort by rating desc by default (leaderboard friendly).
  players.sort((a, b) => b.rating - a.rating);
  return players;
}
