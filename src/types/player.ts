export type Player = {
  rank: number;
  name: string;
  elo: number;

  games: number;
  wins: number;
  losses: number;
  draws: number;

  peak?: number;
  winrate?: number; // 0-100
};

export type PlayerDetails = {
  player: Player;
  history?: Array<{ date: string; elo: number }>;
};
