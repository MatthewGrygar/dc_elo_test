export type DataSource = 'ELO' | 'DCPR';

export type Player = {
  /** 1-based leaderboard position */
  rank: number;
  name: string;
  elo: number;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  peak: number;
  /** 0..1 */
  winrate: number;
};

export type PlayerDetails = Player & {
  /** Optional timeseries for charts in the modal */
  history?: Array<{ date: string; elo: number }>;
};
