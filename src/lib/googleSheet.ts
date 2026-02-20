import type { PlayerRow } from '../types/player';

const SHEET_ID = '1y98bzsIRpVv0_cGNfbITapucO5A6izeEz5lTM92ZbIA';
const SHEET_NAME = 'Elo standings';

/**
 * Google Sheets: simple, keyless read using the Visualization API.
 *
 * Why this approach?
 * - No API key needed
 * - Works on GitHub Pages
 * - Handles public sheets
 *
 * Requirements:
 * - The spreadsheet must be accessible (public or at least "anyone with link can view").
 */
export async function fetchLeaderboardFromSheet(signal?: AbortSignal): Promise<PlayerRow[]> {
  // We query the columns we care about and skip the header row.
  // A=name, B=rating, C=games, D=win, E=loss, F=draw, G=winrate, H=peak
  const query = encodeURIComponent('select A,B,C,D,E,F,G,H where A is not null');

  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodeURIComponent(
    SHEET_NAME
  )}&tq=${query}&tqx=out:json`;

  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`Failed to fetch sheet: ${res.status} ${res.statusText}`);
  }

  const text = await res.text();

  // The API wraps JSON like:
  // google.visualization.Query.setResponse({...});
  const jsonText = text
    .trim()
    .replace(/^\/\*.*?\*\//s, '')
    .replace(/^google\.visualization\.Query\.setResponse\(/, '')
    .replace(/\);\s*$/, '');

  const data = JSON.parse(jsonText) as {
    table?: { rows?: Array<{ c?: Array<{ v?: unknown } | null> }> };
  };

  const rows = data.table?.rows ?? [];

  const parsed: PlayerRow[] = rows
    .map((r) => r.c ?? [])
    .map((c) => {
      const get = (i: number) => (c[i] ? c[i]!.v : null);

      const name = String(get(0) ?? '').trim();
      if (!name) return null;

      const rating = toNumber(get(1));
      const games = toNumber(get(2));
      const win = toNumber(get(3));
      const loss = toNumber(get(4));
      const draw = toNumber(get(5));
      const winrate = toNumber(get(6));
      const peak = toNumber(get(7));

      return {
        id: slugify(name),
        name,
        rating,
        games,
        win,
        loss,
        draw,
        peak,
        winrate
      } satisfies PlayerRow;
    })
    .filter((x): x is PlayerRow => Boolean(x));

  // Sort: highest rating first.
  parsed.sort((a, b) => b.rating - a.rating);

  return parsed;
}

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value.replace('%', '').trim());
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
