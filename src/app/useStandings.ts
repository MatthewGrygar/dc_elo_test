import React from 'react';
import type { DataSource, PlayerStanding } from '@/types/dc';
import { loadStandings } from '@/lib/googleSheets';

type StandingsState = {
  players: PlayerStanding[];
  isLoading: boolean;
  error: string | null;
  refreshedAt: number | null;
};

/**
 * Single source of truth for standings loading.
 *
 * - Cancels in-flight requests when dataSource changes.
 * - Keeps the last data while refetching (better perceived performance).
 */
export function useStandings(dataSource: DataSource) {
  const [state, setState] = React.useState<StandingsState>({
    players: [],
    isLoading: true,
    error: null,
    refreshedAt: null,
  });

  React.useEffect(() => {
    const ctrl = new AbortController();
    setState((s) => ({ ...s, isLoading: true, error: null }));

    loadStandings(dataSource, ctrl.signal)
      .then((players) => {
        setState({
          players,
          isLoading: false,
          error: null,
          refreshedAt: Date.now(),
        });
      })
      .catch((e: unknown) => {
        if (ctrl.signal.aborted) return;
        const msg = e instanceof Error ? e.message : 'Unknown error';
        setState((s) => ({ ...s, isLoading: false, error: msg }));
      });

    return () => ctrl.abort();
  }, [dataSource]);

  return state;
}
