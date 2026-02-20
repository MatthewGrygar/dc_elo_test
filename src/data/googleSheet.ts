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
const DEFAULT_SHEET_NAME = "Elo standings";

function buildGvizUrl(sheetName: string) {
  // We select columns A–H (A,B,C,D,E,F,G,H) and skip header row.
  return (
    "https://docs.google.com/spreadsheets/d/" +
    SHEET_ID +
    "/gviz/tq?sheet=" +
    encodeURIComponent(sheetName) +
    "&tq=" +
    encodeURIComponent("select A,B,C,D,E,F,G,H") +
    "&headers=1"
  );
}

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

export async function fetchPlayersFromGoogleSheet(sheetName: string = DEFAULT_SHEET_NAME): Promise<Player[]> {
  const res = await fetch(buildGvizUrl(sheetName), { cache: "no-store" });
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
    let winrate = toNumber(c[6]?.v);
    // Sheet may provide winrate as 0.55 (fraction) OR 55 (percent). Normalize to 0..1.
    if (winrate > 1) winrate = winrate / 100;
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
  // IMPORTANT: Preserve the sheet row order (source-of-truth ranking).
  return players;
}
