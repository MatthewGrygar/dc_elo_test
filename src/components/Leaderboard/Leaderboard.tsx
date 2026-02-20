import type { PlayerRow } from "../../types/player";
import styles from "./leaderboard.module.css";
import { PlayerRowCard } from "./PlayerRowCard";

type Props = {
  players: PlayerRow[];
  loading: boolean;
  onSelectPlayer: (player: PlayerRow) => void;
};

/**
 * Leaderboard is intentionally "dumb": it receives players already normalized.
 * Sorting/filtering UI can be added here later.
 */
export function Leaderboard({ players, loading, onSelectPlayer }: Props) {
  return (
    <div className={`${styles.wrapper} panel`}>
      <div className={styles.headerRow}>
        <div>#</div>
        <div>Jméno</div>
        <div className={styles.right}>Rating</div>
        <div className={styles.right}>Games</div>
        <div className={styles.right}>W</div>
        <div className={styles.right}>L</div>
        <div className={styles.right}>D</div>
        <div className={styles.right}>Winrate</div>
        <div className={styles.right}>Peak</div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : players.length === 0 ? (
        <div className={styles.loading}>No players found.</div>
      ) : (
        <div className={styles.list}>
          {players.map((p, idx) => (
            <PlayerRowCard
              key={`${p.name}-${idx}`}
              rank={idx + 1}
              player={p}
              onClick={() => onSelectPlayer(p)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
