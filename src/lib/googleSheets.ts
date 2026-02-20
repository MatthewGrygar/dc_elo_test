/**
 * Google Sheets loader (no API key)
 *
 * We use the "GViz" endpoint which returns a JS snippet:
 *   google.visualization.Query.setResponse(<JSON>);
 *
 * Pros: simple, no key
 * Cons: format is quirky; permissions/CORS can change if sheet isn't publicly readable
 *
 * Sheet details given by user:
 * - Spreadsheet: 1y98bzsIRpVv0_cGNfbITapucO5A6izeEz5lTM92ZbIA
 * - Sheet name: "Elo standings"
 * - Data:
 *   A = Name
 *   B = Rating
 *   C = Games
 *   D = Win
 *   E = Loss
 *   F = Draw
 *   G = Winrate
 *   H = Peak
 */

export type PlayerRow = {
  name: string;
  rating: number;
  games: number;
  win: number;
  loss: number;
  draw: number;
  winrate: number; // as percent (0..100)
  peak: number;
};

const SPREADSHEET_ID = "1y98bzsIRpVv0_cGNfbITapucO5A6izeEz5lTM92ZbIA";
const SHEET_NAME = "Elo standings";
const RANGE = "A2:H"; // everything from row 2 down

function buildGvizUrl(): string {
  const params = new URLSearchParams({
    tqx: "out:json",
    sheet: SHEET_NAME,
    range: RANGE,
  });

  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?${params.toString()}`;
}

/**
 * GViz returns text like:
 *   /*O_o*\/\ngoogle.visualization.Query.setResponse({...});
 *
 * We extract the {...} JSON part and parse it.
 */
function parseGviz(text: string): any {
  const match = text.match(/setResponse\((.*)\);?\s*$/s);
  if (!match) {
    throw new Error("Unexpected GViz response format (missing setResponse(...)).");
  }
  return JSON.parse(match[1]);
}

function num(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = Number(value.replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function rowCell(row: any, idx: number): unknown {
  // GViz row format: { c: [{v:...},{v:...}, ...] }
  const cell = row?.c?.[idx];
  return cell?.v ?? "";
}

/**
 * Fetch players from sheets.
 * Returns empty array on "no rows"; throws on network/format issues.
 */
export async function fetchPlayersFromSheets(): Promise<PlayerRow[]> {
  const url = buildGvizUrl();
  const res = await fetch(url, { method: "GET" });

  if (!res.ok) {
    throw new Error(`Failed to fetch Google Sheet (${res.status} ${res.statusText}).`);
  }

  const text = await res.text();
  const json = parseGviz(text);

  const rows: any[] = json?.table?.rows ?? [];
  return rows
    .map((r) => {
      const name = String(rowCell(r, 0) ?? "").trim();
      if (!name) return null;

      const rating = num(rowCell(r, 1));
      const games = num(rowCell(r, 2));
      const win = num(rowCell(r, 3));
      const loss = num(rowCell(r, 4));
      const draw = num(rowCell(r, 5));
      const winrate = num(rowCell(r, 6));
      const peak = num(rowCell(r, 7));

      return { name, rating, games, win, loss, draw, winrate, peak } satisfies PlayerRow;
    })
    .filter(Boolean) as PlayerRow[];
}
