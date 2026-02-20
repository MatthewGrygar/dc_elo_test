import type { PlayerRow } from '../types/player';
import { Leaderboard } from './Leaderboard';

export function LeaderboardSection({
  players,
  isLoading,
  error,
  onSelectPlayer
}: {
  players: PlayerRow[];
  isLoading: boolean;
  error: string | null;
  onSelectPlayer: (p: PlayerRow) => void;
}) {
  return (
    <section id="leaderboard" className="stack-lg" aria-label="Leaderboard">
      <div className="sectionHeader">
        <h2 className="sectionTitle">Leaderboard</h2>
        <p className="sectionSubtitle muted">
          Live list from <span className="mono">Elo standings</span> sheet (A–H).
        </p>
      </div>

      {error ? (
        <div className="panel alert">
          <div className="alertTitle">Could not load data</div>
          <div className="muted">{error}</div>
        </div>
      ) : null}

      <Leaderboard players={players} isLoading={isLoading} onSelect={onSelectPlayer} />
    </section>
  );
}
