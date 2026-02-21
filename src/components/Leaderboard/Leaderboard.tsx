import type { Player } from '../../types/player';
import { PlayerRow } from './PlayerRow';

/**
 * Leaderboard is intentionally implemented dependency-free.
 *
 * If you later expect 200+ rows and want perfect scroll performance,
 * swap this component for react-window (virtualized list).
 */
export function Leaderboard({ players }: { players: Player[] }) {
  return (
    <div className="leaderboard__body" role="table" aria-label="Seznam hráčů">
      <div className="leaderboard__list">
        {players.map((p) => (
          <PlayerRow key={`${p.rank}-${p.name}`} player={p} />
        ))}
      </div>
    </div>
  );
}
