import type { DataSource, Player } from '../types/player';
import { csvToObjects } from './csv';

/**
 * Google Sheets are used as a simple "public database".
 *
 * For public access without credentials we rely on "Publish to web" CSV endpoints.
 *
 * Provide these URLs through Vite env vars (recommended):
 *  - VITE_SHEETS_ELO_STANDINGS_CSV
 *  - VITE_SHEETS_TOURNAMENT_ELO_CSV (future DCPR)
 */
const CSV_URLS: Record<DataSource, string | undefined> = {
  ELO: import.meta.env.VITE_SHEETS_ELO_STANDINGS_CSV,
  DCPR: import.meta.env.VITE_SHEETS_TOURNAMENT_ELO_CSV,
};

function toNumber(v: string, fallback = 0) {
  const n = Number(String(v).replace('%', '').replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
}

function normalizeName(v: string) {
  return v.trim();
}

function mapRowToPlayer(row: Record<string, string>, rank: number): Player {
  // Flexible column mapping (because sheet headers may evolve).
  const name = row['Name'] ?? row['Player'] ?? row['Jméno'] ?? row['Hráč'] ?? '';

  const elo = row['ELO'] ?? row['Elo'] ?? row['Rating'] ?? '';
  const games = row['Games'] ?? row['Hry'] ?? '';
  const wins = row['Wins'] ?? row['Win'] ?? row['Výhry'] ?? '';
  const losses = row['Loss'] ?? row['Losses'] ?? row['Prohry'] ?? '';
  const draws = row['Draw'] ?? row['Draws'] ?? row['Remízy'] ?? '';
  const peak = row['Peak'] ?? row['Top'] ?? row['Maximum'] ?? '';
  const winrate = row['Winrate'] ?? row['WR'] ?? row['Win Rate'] ?? row['Procenta'] ?? '';

  return {
    rank,
    name: normalizeName(name || `Player ${rank}`),
    elo: toNumber(elo),
    games: toNumber(games),
    wins: toNumber(wins),
    losses: toNumber(losses),
    draws: toNumber(draws),
    peak: toNumber(peak, toNumber(elo)),
    winrate: winrate.includes('%') ? toNumber(winrate) / 100 : toNumber(winrate),
  };
}

export async function fetchStandings(source: DataSource): Promise<Player[]> {
  const url = CSV_URLS[source];
  if (!url) {
    // No URL configured -> return deterministic mock.
    return getMockStandings();
  }

  const res = await fetch(url, { headers: { Accept: 'text/csv' } });
  if (!res.ok) {
    throw new Error(`Failed to fetch CSV (${res.status}).`);
  }
  const text = await res.text();
  const objects = csvToObjects(text);

  // Remove empty lines & sort by ELO desc as a safe default
  const players = objects
    .filter((o) => Object.values(o).some((v) => String(v).trim() !== ''))
    .map((o, idx) => mapRowToPlayer(o, idx + 1))
    .sort((a, b) => b.elo - a.elo)
    .map((p, idx) => ({ ...p, rank: idx + 1 }));

  return players;
}

function getMockStandings(): Player[] {
  const base = [
    { name: 'Karel "Tempo" Novak', elo: 1864, games: 52, wins: 34, losses: 16, draws: 2, peak: 1892 },
    { name: 'Petra "Control" Svobodová', elo: 1821, games: 61, wins: 38, losses: 20, draws: 3, peak: 1849 },
    { name: 'Marek "Midrange" Dvořák', elo: 1760, games: 45, wins: 26, losses: 17, draws: 2, peak: 1793 },
    { name: 'Lucie "Combo" Veselá', elo: 1712, games: 40, wins: 21, losses: 17, draws: 2, peak: 1740 },
    { name: 'Ondřej "Aggro" Černý', elo: 1689, games: 57, wins: 28, losses: 25, draws: 4, peak: 1708 },
  ];

  return base
    .map((p, i) => ({
      rank: i + 1,
      ...p,
      winrate: p.games ? p.wins / p.games : 0,
    }))
    .concat(
      Array.from({ length: 55 }).map((_, i) => {
        const rank = base.length + i + 1;
        const elo = 1600 - i * 6;
        const games = 10 + (i % 17);
        const wins = Math.max(0, Math.round(games * (0.45 + (i % 7) * 0.03)));
        const losses = Math.max(0, games - wins);
        return {
          rank,
          name: `Player ${rank}`,
          elo,
          games,
          wins,
          losses,
          draws: 0,
          peak: elo + 25,
          winrate: wins / games,
        };
      }),
    );
}
