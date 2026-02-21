import type { Player } from '../../types/player';
import { PlayerRow } from './PlayerRow';

function HeadCell({ children }: { children: React.ReactNode }) {
  return <div className="lb__th">{children}</div>;
}

export function LeaderboardTable({ players, loading, onSelectPlayer }: { players: Player[]; loading: boolean; onSelectPlayer: (p: Player) => void }) {
  return (
    <div className="lb">
      <div className="lb__head">
        <HeadCell>#</HeadCell>
        <HeadCell>Hráč</HeadCell>
        <HeadCell>ELO</HeadCell>
        <HeadCell>Games</HeadCell>
        <HeadCell>W</HeadCell>
        <HeadCell>L</HeadCell>
        <HeadCell>D</HeadCell>
        <HeadCell>Peak</HeadCell>
        <HeadCell>Winrate</HeadCell>
      </div>

      <div className="lb__body" role="list">
        {loading && <div className="lb__state">Načítám data…</div>}
        {!loading && players.length === 0 && (
          <div className="lb__state">
            Žádná data. Nastav CSV URL v <code>.env</code> nebo zkontroluj sdílení sheetu.
          </div>
        )}

        {players.map((p) => (
          <PlayerRow key={p.rank + p.name} player={p} onClick={() => onSelectPlayer(p)} />
        ))}
      </div>
    </div>
  );
}
