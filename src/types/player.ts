/**
 * Canonical data model for the Leaderboard.
 *
 * Keep this file stable and well-documented: other future AI/engineers
 * should be able to reason about the app's core domain types from here.
 */
export type PlayerRow = {
  /** Stable slug-like id derived from name (until we introduce real IDs). */
  id: string;

  /** Display name. */
  name: string;

  /** Current rating. */
  rating: number;

  /** Total played games. */
  games: number;

  win: number;
  loss: number;
  draw: number;

  /** Historical best rating. */
  peak: number;

  /** Winrate in percentage (0..100), or 0 if unknown. */
  winrate: number;
};
