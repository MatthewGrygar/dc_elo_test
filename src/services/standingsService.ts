import type { DataSource } from '../types/app';
import type { Player } from '../types/player';
import { getSheetsConfig } from '../config/sheets';
import { clamp01 } from '../utils/format';
import { fetchCsvRows } from './sheetsClient';

/**
 * Column mapping notes:
 * Google Sheets CSV headers are whatever is in the first row.
 * Adjust these keys to match your sheet.
 */
const COLUMN_KEYS = {
  rank: ['Rank', '#', 'rank'],
  name: ['Name', 'Player', 'player', 'Jméno', 'Hráč'],
  elo: ['ELO', 'Elo', 'Rating'],
  games: ['Games', 'GP', 'Matches', 'Hry'],
  wins: ['Wins', 'Win', 'W', 'Vítězství'],
  losses: ['Loss', 'Losses', 'L', 'Prohry'],
  draws: ['Draw', 'Draws', 'D', 'Remízy'],
  peak: ['Peak', 'Peak ELO', 'Max', 'Maximum'],
  winrate: ['Winrate', 'WR', 'Win Rate', 'Win%']
} as const;

function pick(row: Record<string, string>, keys: readonly string[]): string | undefined {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === 'string' && v.trim().length) return v;
  }
  return undefined;
}

function toNumber(v: string | undefined): number {
  if (!v) return 0;
  const cleaned = v.replace('%', '').replace(',', '.').trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function inferWinrate(row: Record<string, string>): number {
  const explicit = pick(row, COLUMN_KEYS.winrate);
  if (explicit) {
    const raw = toNumber(explicit);
    return clamp01(raw > 1 ? raw / 100 : raw);
  }

  const wins = toNumber(pick(row, COLUMN_KEYS.wins));
  const games = toNumber(pick(row, COLUMN_KEYS.games));
  if (games <= 0) return 0;
  return clamp01(wins / games);
}

function stableId(rank: number, name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-áčďéěíňóřšťúůýž]/giu, '');
  return `${rank}-${slug}`;
}

export async function loadStandings(source: DataSource, signal?: AbortSignal): Promise<Player[]> {
  const { standingsCsvUrl } = getSheetsConfig(source);
  const rows = await fetchCsvRows(standingsCsvUrl, signal);

  const players: Player[] = rows
    .map((r, idx) => {
      const rank = Math.max(1, Math.floor(toNumber(pick(r, COLUMN_KEYS.rank)) || idx + 1));
      const name = (pick(r, COLUMN_KEYS.name) ?? `Player ${rank}`).trim();

      const elo = Math.round(toNumber(pick(r, COLUMN_KEYS.elo)));
      const games = Math.round(toNumber(pick(r, COLUMN_KEYS.games)));
      const wins = Math.round(toNumber(pick(r, COLUMN_KEYS.wins)));
      const losses = Math.round(toNumber(pick(r, COLUMN_KEYS.losses)));
      const draws = Math.round(toNumber(pick(r, COLUMN_KEYS.draws)));
      const peak = Math.round(toNumber(pick(r, COLUMN_KEYS.peak)) || elo);
      const winrate = inferWinrate(r);

      return {
        id: stableId(rank, name),
        rank,
        name,
        elo,
        games,
        wins,
        losses,
        draws,
        peak,
        winrate
      };
    })
    // Defensive: ensure stable sorting
    .sort((a, b) => a.rank - b.rank);

  return players;
}
