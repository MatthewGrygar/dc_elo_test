import type { PlayerRow } from '../types/player';

/**
 * Data layer (v0): Google Sheets as the source of truth.
 *
 * We intentionally avoid API keys and use the "Google Visualization" endpoint.
 * It works for public sheets and returns JSON embedded in a JS function call.
 *
 * Docs-ish references:
 * - Many public examples online use: /gviz/tq?sheet=<NAME>&tqx=out:json
 */

const SHEET_ID = '1y98bzsIRpVv0_cGNfbITapucO5A6izeEz5lTM92ZbIA';
const SHEET_NAME = 'Elo standings';

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const normalized = value.replace(',', '.');
    const n = Number(normalized);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function parseGvizResponse(raw: string): unknown {
  // Response looks like: google.visualization.Query.setResponse({...});
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('Unexpected gviz response format');
  return JSON.parse(raw.slice(start, end + 1));
}

/**
 * Fetches player standings from the sheet.
 *
 * Mapping (per your spec):
 * - Name:   A
 * - Rating: B
 * - Games:  C
 * - Win:    D
 * - Loss:   E
 * - Draw:   F
 * - Winrate:G
 * - Peak:   H
 */
export async function fetchPlayersFromSheet(signal?: AbortSignal): Promise<PlayerRow[]> {
  const url = new URL(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq`);
  url.searchParams.set('sheet', SHEET_NAME);
  url.searchParams.set('tqx', 'out:json');

  const res = await fetch(url.toString(), { signal });
  if (!res.ok) throw new Error(`Failed to fetch sheet: ${res.status}`);

  const text = await res.text();
  const json = parseGvizResponse(text) as any;

  const rows: any[] = json?.table?.rows ?? [];

  // The sheet contains header in row 1; gviz usually respects that and starts data in rows array.
  const players: PlayerRow[] = rows
    .map((r) => r.c?.map((c: any) => c?.v) ?? [])
    .filter((cells) => typeof cells?.[0] === 'string' && String(cells[0]).trim().length > 0)
    .map((cells) => {
      const winrateRaw = cells[6];
      const winrate = toNumber(winrateRaw);
      // If sheet stores winrate in percent (e.g. 63.5), convert to 0..1.
      const normalizedWinrate = winrate > 1 ? winrate / 100 : winrate;

      return {
        name: String(cells[0]).trim(),
        rating: toNumber(cells[1]),
        games: toNumber(cells[2]),
        win: toNumber(cells[3]),
        loss: toNumber(cells[4]),
        draw: toNumber(cells[5]),
        winrate: normalizedWinrate,
        peak: toNumber(cells[7]),
      } satisfies PlayerRow;
    })
    .sort((a, b) => b.rating - a.rating);

  return players;
}

/**
 * Offline-friendly fallback.
 *
 * Used only when the Google Sheet is unreachable (e.g. rate-limited / blocked).
 */
export const demoPlayers: PlayerRow[] = [
  { name: 'Placeholder One', rating: 1820, games: 44, win: 28, loss: 13, draw: 3, winrate: 0.64, peak: 1852 },
  { name: 'Placeholder Two', rating: 1762, games: 31, win: 18, loss: 10, draw: 3, winrate: 0.58, peak: 1801 },
  { name: 'Placeholder Three', rating: 1694, games: 22, win: 11, loss: 9, draw: 2, winrate: 0.5, peak: 1710 },
  { name: 'Placeholder Four', rating: 1602, games: 18, win: 8, loss: 8, draw: 2, winrate: 0.44, peak: 1629 }
];
