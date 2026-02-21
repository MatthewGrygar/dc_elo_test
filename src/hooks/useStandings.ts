import { useEffect, useMemo, useState } from 'react';
import type { DataSource } from '../types/app';
import type { Player } from '../types/player';
import { loadStandings } from '../services/standingsService';

export function useStandings(source: DataSource) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();

    setIsLoading(true);
    setError(null);

    loadStandings(source, ctrl.signal)
      .then(setPlayers)
      .catch((e: unknown) => {
        if (ctrl.signal.aborted) return;
        const message = e instanceof Error ? e.message : 'Unknown error';
        setError(message);
        setPlayers([]);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setIsLoading(false);
      });

    return () => ctrl.abort();
  }, [source]);

  const derived = useMemo(() => {
    const totalPlayers = players.length;
    const totalGames = players.reduce((acc, p) => acc + (p.games || 0), 0);
    const avgElo = totalPlayers ? players.reduce((acc, p) => acc + p.elo, 0) / totalPlayers : 0;
    const topElo = totalPlayers ? Math.max(...players.map((p) => p.elo)) : 0;

    return { totalPlayers, totalGames, avgElo, topElo };
  }, [players]);

  return { players, ...derived, isLoading, error };
}
