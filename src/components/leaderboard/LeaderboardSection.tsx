import type { Player } from '../../types/player';
import { LeaderboardTable } from './LeaderboardTable';

export function LeaderboardSection({ players, loading, onSelectPlayer }: { players: Player[]; loading: boolean; onSelectPlayer: (p: Player) => void }) {
  return (
    <section id="leaderboard" className="section" aria-label="Leaderboard">
      <div className="section__header">
        <h2 className="section__title">Leaderboard</h2>
        <p className="section__hint">Klikni na hráče pro detail (modal).</p>
      </div>

      <div className="panel leaderboard">
        <LeaderboardTable players={players} loading={loading} onSelectPlayer={onSelectPlayer} />
      </div>
    </section>
  );
}
