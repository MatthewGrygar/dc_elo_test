import Papa from 'papaparse';
import type { DataSource, PlayerStanding } from '@/types/dc';

/**
 * IMPORTANT
 * ---------
 * This project intentionally uses a *public* Google Sheet as a read-only data layer.
 * We fetch the sheet as CSV via the Visualization endpoint, which works for public sheets:
 *   https://docs.google.com/spreadsheets/d/<id>/gviz/tq?tqx=out:csv&sheet=<SheetName>
 *
 * If you ever make the sheet private, you'll need a backend / service account.
 */
const SPREADSHEET_ID = '1y98bzsIRpVv0_cGNfbITapucO5A6izeEz5lTM92ZbIA';

const SHEET_BY_SOURCE: Record<DataSource, string> = {
  ELO: 'Elo standings',
  DCPR: 'Tournament_Elo',
};

export class SheetsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SheetsError';
  }
}

function csvUrl(sheetName: string) {
  const encoded = encodeURIComponent(sheetName);
  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encoded}`;
}

function toNumber(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const s = String(value).trim();
  if (!s) return 0;
  const normalized = s.replace(',', '.');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function makeId(name: string) {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 64);
}

/**
 * Parses standings from the sheet columns:
 *  A Name
 *  B Rating
 *  C Games
 *  D Win
 *  E Loss
 *  F Draw
 *  G Winrate
 *  H Peak
 */
export async function loadStandings(source: DataSource, signal?: AbortSignal): Promise<PlayerStanding[]> {
  const sheetName = SHEET_BY_SOURCE[source];
  const res = await fetch(csvUrl(sheetName), { signal });
  if (!res.ok) throw new SheetsError(`Failed to fetch sheet (${res.status}).`);
  const csv = await res.text();

  const parsed = Papa.parse<string[]>(csv, {
    skipEmptyLines: 'greedy',
  });

  if (parsed.errors?.length) {
    throw new SheetsError(parsed.errors[0]?.message ?? 'Failed to parse CSV.');
  }

  const rows = (parsed.data ?? []) as unknown as string[][];
  if (!rows.length) return [];

  // First row is header.
  const body = rows.slice(1);

  const players: PlayerStanding[] = body
    .map((r) => {
      const name = (r[0] ?? '').trim();
      if (!name) return null;
      const rating = Math.round(toNumber(r[1]));
      const games = Math.round(toNumber(r[2]));
      const win = Math.round(toNumber(r[3]));
      const loss = Math.round(toNumber(r[4]));
      const draw = Math.round(toNumber(r[5]));
      const winrateRaw = toNumber(r[6]);
      // Winrate in the sheet might be in percentage or 0..1.
      const winrate = clamp01(winrateRaw > 1.2 ? winrateRaw / 100 : winrateRaw);
      const peak = Math.round(toNumber(r[7]));

      return {
        id: makeId(name),
        name,
        rating,
        games,
        win,
        loss,
        draw,
        winrate,
        peak,
      } satisfies PlayerStanding;
    })
    .filter((x): x is PlayerStanding => Boolean(x));

  // Sorting is a UI concern, but a sane default helps.
  players.sort((a, b) => b.rating - a.rating);

  return players;
}
