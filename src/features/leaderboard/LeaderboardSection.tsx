import React from 'react';
import type { PlayerStanding } from '@/types/dc';
import type { StandingsResult } from '@/components/AppShell';
import { LeaderboardTable } from '@/features/leaderboard/LeaderboardTable';

export function LeaderboardSection({
  standings,
  onSelectPlayer,
}: {
  standings: StandingsResult;
  onSelectPlayer: (p: PlayerStanding) => void;
}) {
  const [query, setQuery] = React.useState('');

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return standings.players;
    return standings.players.filter((p) => p.name.toLowerCase().includes(q));
  }, [query, standings.players]);

  return (
    <section id="leaderboard" className="section">
      <div className="sectionHeader leaderboardHeader">
        <div>
          <h2 className="sectionTitle">Leaderboard</h2>
          <div className="sectionMeta">
            {standings.isLoading
              ? 'Načítám…'
              : `${filtered.length.toLocaleString('cs-CZ')} hráčů`}
          </div>
        </div>

        <div className="leaderboardTools">
          <input
            className="search"
            placeholder="Hledat hráče…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
          />
        </div>
      </div>

      <LeaderboardTable
        players={filtered}
        isLoading={standings.isLoading}
        onSelectPlayer={onSelectPlayer}
      />
    </section>
  );
}
