export type Player = {
  /** Stable ID for list rendering; derived from name + rank as fallback. */
  id: string;
  rank: number;
  name: string;
  elo: number;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  peak: number;
  winrate: number; // 0..1
};
