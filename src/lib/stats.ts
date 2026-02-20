import { Player } from "../types/player";

export type SummaryStats = {
  players: number;
  totalGames: number;
  avgRating: number;
  topRating: number;
};

export function computeSummary(players: Player[]): SummaryStats {
  const playersCount = players.length;
  const totalGames = players.reduce((acc, p) => acc + p.games, 0);
  const avgRating =
    playersCount > 0 ? players.reduce((acc, p) => acc + p.rating, 0) / playersCount : 0;
  const topRating = playersCount > 0 ? Math.max(...players.map((p) => p.rating)) : 0;

  return { players: playersCount, totalGames, avgRating, topRating };
}
