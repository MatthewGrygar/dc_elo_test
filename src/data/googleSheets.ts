import type { PlayerRow } from "../types/player";
import { parseCsv } from "./parseCsv";

/**
 * Google Sheets data access is isolated here.
 * If we later migrate to an API, only this folder should need changes.
 */

const SHEET_ID = "1y98bzsIRpVv0_cGNfbITapucO5A6izeEz5lTM92ZbIA";
const SHEET_NAME = "Elo standings";

/**
 * CSV endpoint (public sheets):
 * https://docs.google.com/spreadsheets/d/<id>/gviz/tq?tqx=out:csv&sheet=<sheetName>
 */
function buildCsvUrl() {
  const params = new URLSearchParams({
    "tqx": "out:csv",
    "sheet": SHEET_NAME,
  });
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?${params.toString()}`;
}

function toNumber(v: string): number {
  const cleaned = v.replace("%", "").replace(",", ".").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Fetch players from the Google Sheet and map columns to PlayerRow.
 * Rows start at A2. We ignore empty names.
 */
export async function fetchPlayersFromSheet(signal?: AbortSignal): Promise<PlayerRow[]> {
  const res = await fetch(buildCsvUrl(), {
    method: "GET",
    headers: { "Accept": "text/csv" },
    signal,
  });

  if (!res.ok) {
    throw new Error(`Google Sheet fetch failed: ${res.status} ${res.statusText}`);
  }

  const csv = await res.text();
  const rows = parseCsv(csv);

  // First row often contains headers. We detect it by looking at the first cell.
  const startIndex = rows.length > 0 && rows[0][0]?.toLowerCase().includes("name") ? 1 : 0;

  const players: PlayerRow[] = [];
  for (let i = startIndex; i < rows.length; i++) {
    const r = rows[i] ?? [];
    const name = (r[0] ?? "").trim();
    if (!name) continue;

    players.push({
      name,
      rating: toNumber(r[1] ?? "0"),
      games: toNumber(r[2] ?? "0"),
      win: toNumber(r[3] ?? "0"),
      loss: toNumber(r[4] ?? "0"),
      draw: toNumber(r[5] ?? "0"),
      winrate: toNumber(r[6] ?? "0"),
      peak: toNumber(r[7] ?? "0"),
    });
  }

  return players;
}
