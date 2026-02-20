import { Player } from "../types/player";

/**
 * Fallback data ensures the UI is testable even when:
 * - Google Sheet isn't public
 * - rate limits
 * - offline development
 */
export const fallbackPlayers: Player[] = [
  { id: "Alice", name: "Alice", rating: 1875, games: 42, win: 28, loss: 12, draw: 2, winrate: 66.7, peak: 1902 },
  { id: "Bob", name: "Bob", rating: 1820, games: 35, win: 20, loss: 13, draw: 2, winrate: 58.8, peak: 1860 },
  { id: "Cyril", name: "Cyril", rating: 1764, games: 50, win: 29, loss: 18, draw: 3, winrate: 60.4, peak: 1799 },
  { id: "Diana", name: "Diana", rating: 1712, games: 22, win: 13, loss: 8, draw: 1, winrate: 61.9, peak: 1735 },
  { id: "Eli", name: "Eli", rating: 1688, games: 19, win: 10, loss: 8, draw: 1, winrate: 55.6, peak: 1701 },
];
