export type Theme = 'light' | 'dark';

export type DataSource = 'ELO' | 'DCPR';

export type PlayerStanding = {
  /** Stable id for React list keys. */
  id: string;
  name: string;
  rating: number;
  games: number;
  win: number;
  loss: number;
  draw: number;
  winrate: number; // 0..1
  peak: number;
};

export type SummaryStats = {
  medianElo: number;
  totalGames: number;
  uniquePlayers: number;
  active7d: number;
  active30d: number;
  new30d: number;
  matchesWeek: number;
  matchesMonth: number;
  avgDeltaEloPerMatch: number;
  upsetPercent: number;
};
