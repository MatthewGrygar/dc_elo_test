import axios from 'axios';
import type { DataSource } from '../types/app';
import type { Player } from '../types/player';
import { normalizeHeaderKey, parseCsv } from './csv';

const ELO_URL = import.meta.env.VITE_SHEETS_ELO_CSV_URL as string | undefined;
const DCPR_URL = import.meta.env.VITE_SHEETS_DCPR_CSV_URL as string | undefined;

export function getCsvUrl(source: DataSource): string | null {
  const url = source === 'ELO' ? ELO_URL : DCPR_URL;
  return url && url.trim().length > 0 ? url.trim() : null;
}

function toNumberSafe(v: string): number {
  const x = Number(String(v ?? '').replace('%', '').trim());
  return Number.isFinite(x) ? x : 0;
}

function mapRowToPlayer(row: Record<string, string>, rank: number): Player {
  const name = row.name ?? row.player ?? row.nickname ?? 'Unknown';
  const elo = toNumberSafe(row.elo ?? row.rating ?? '0');
  const games = toNumberSafe(row.games ?? row.played ?? '0');
  const wins = toNumberSafe(row.wins ?? row.win ?? '0');
  const losses = toNumberSafe(row.losses ?? row.loss ?? '0');
  const draws = toNumberSafe(row.draws ?? row.draw ?? '0');

  const peakRaw = row.peak ?? row.max ?? '';
  const peak = peakRaw ? toNumberSafe(peakRaw) : undefined;

  let winrate: number | undefined = undefined;
  const wrRaw = row.winrate ?? row.wr ?? '';
  if (wrRaw) {
    const n = toNumberSafe(wrRaw);
    winrate = n <= 1 ? n * 100 : n;
  } else if (games > 0) {
    winrate = (wins / games) * 100;
  }

  return { rank, name: String(name).trim(), elo, games, wins, losses, draws, peak, winrate };
}

export async function fetchPlayersFromSheets(source: DataSource): Promise<Player[]> {
  const url = getCsvUrl(source);
  if (!url) return getDemoPlayers(source);

  const res = await axios.get<string>(url, { responseType: 'text' });
  const table = parseCsv(res.data);

  if (table.length < 2) return [];

  const headerRow = table[0].map(normalizeHeaderKey);
  const dataRows = table.slice(1);

  const items: Player[] = [];
  for (let i = 0; i < dataRows.length; i++) {
    const cells = dataRows[i];
    const record: Record<string, string> = {};
    for (let c = 0; c < headerRow.length; c++) record[headerRow[c]] = cells[c] ?? '';
    items.push(mapRowToPlayer(record, i + 1));
  }

  items.sort((a, b) => b.elo - a.elo);
  return items.map((p, idx) => ({ ...p, rank: idx + 1 }));
}

function getDemoPlayers(source: DataSource): Player[] {
  const base = source === 'ELO' ? 1500 : 1200;
  const names = ['Karel Novák', 'Lucie Šimková', 'Tomáš Horák', 'Eliška Veselá', 'Jan Dvořák', 'Veronika Malá', 'Petr Svoboda', 'Adam Král'];

  const demo = names.map((name, i) => {
    const elo = base + (names.length - i) * 42 + (i % 2 === 0 ? 12 : -9);
    const games = 25 + i * 6;
    const wins = Math.round(games * (0.45 + i * 0.03));
    const draws = Math.round(games * 0.05);
    const losses = Math.max(0, games - wins - draws);
    return { rank: i + 1, name, elo, games, wins, losses, draws, peak: elo + 60, winrate: (wins / games) * 100 };
  });

  demo.sort((a, b) => b.elo - a.elo);
  return demo.map((p, idx) => ({ ...p, rank: idx + 1 }));
}
