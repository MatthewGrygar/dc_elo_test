import React, { useMemo } from 'react';
import type { Player } from '../../types/player';
import { Panel } from '../common/Panel';
import { InlineStatus } from '../common/InlineStatus';
import { LeaderboardTable } from './LeaderboardTable';

export function LeaderboardSection({
  players,
  isLoading,
  error,
  onSelectPlayer
}: {
  players: Player[];
  isLoading: boolean;
  error: string | null;
  onSelectPlayer: (p: Player) => void;
}) {
  const top = useMemo(() => players.slice(0, 3), [players]);

  return (
    <section id="leaderboard" className="section">
      <div className="section__head">
        <div>
          <h2 className="section__title">Leaderboard</h2>
          <p className="section__subtitle">Klikni na hráče pro detail. Seznam je virtualizovaný pro plynulost.</p>
        </div>
      </div>

      {error ? (
        <InlineStatus
          tone="danger"
          title="Leaderboard není dostupný"
          message="Nepodařilo se načíst data ze sheetu. Ověř publikované CSV a hlavičky sloupců."
        />
      ) : null}

      <div className="leaderboardLayout">
        <Panel variant="soft" className="leaderboardCard">
          <div className="leaderboardCard__title">Top 3</div>
          <div className="podium">
            {top.map((p) => (
              <button key={p.id} className="podium__item" onClick={() => onSelectPlayer(p)}>
                <div className="podium__rank">#{p.rank}</div>
                <div className="podium__name">{p.name}</div>
                <div className="podium__elo">{p.elo}</div>
              </button>
            ))}
            {isLoading ? <div className="podium__skeleton">Načítám…</div> : null}
          </div>
        </Panel>

        <Panel variant="soft" className="leaderboardCard leaderboardCard--table">
          <LeaderboardTable players={players} isLoading={isLoading} onSelectPlayer={onSelectPlayer} />
        </Panel>
      </div>
    </section>
  );
}
