import React from 'react';
import type { PlayerRow } from '../types/player';
import { fetchLeaderboardFromSheet } from './googleSheet';

export type LeaderboardState = {
  players: PlayerRow[];
  isLoading: boolean;
  error: string | null;
  refreshedAt: number | null;
  refresh: () => void;
};

/**
 * Fetches leaderboard data.
 *
 * Design goals:
 * - Works without backend (GitHub Pages)
 * - Explicit loading/error states
 * - Abortable requests (important for fast nav / HMR)
 */
export function useLeaderboard(): LeaderboardState {
  const [players, setPlayers] = React.useState<PlayerRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = React.useState<number | null>(null);

  const refresh = React.useCallback(() => {
    const controller = new AbortController();

    setIsLoading(true);
    setError(null);

    fetchLeaderboardFromSheet(controller.signal)
      .then((rows) => {
        setPlayers(rows);
        setRefreshedAt(Date.now());
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  React.useEffect(() => {
    const abort = refresh();
    return () => abort?.();
  }, [refresh]);

  return { players, isLoading, error, refreshedAt, refresh };
}
