import { useEffect, useMemo, useState } from 'react';
import type { DataSource, Player } from '../types/player';
import { fetchStandings } from '../services/googleSheets';

export function useStandings(dataSource: DataSource) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchStandings(dataSource)
      .then((p) => {
        if (cancelled) return;
        setPlayers(p);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Unknown error');
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dataSource]);

  const stats = useMemo(() => {
    const count = players.length;
    const games = players.reduce((acc, p) => acc + p.games, 0);
    const avgElo = count ? players.reduce((acc, p) => acc + p.elo, 0) / count : 0;
    const topElo = players[0]?.elo ?? 0;

    return {
      playersCount: count,
      gamesTotal: games,
      avgElo,
      topElo,
    };
  }, [players]);

  return { players, stats, isLoading, error };
}
