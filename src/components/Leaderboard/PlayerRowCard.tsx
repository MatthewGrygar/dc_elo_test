import type { PlayerRow } from "../../types/player";
import styles from "./leaderboard.module.css";

type Props = {
  rank: number;
  player: PlayerRow;
  onClick: () => void;
};

function fmtPct(v: number) {
  if (!Number.isFinite(v)) return "—";
  return `${v.toFixed(1)}%`;
}

export function PlayerRowCard({ rank, player, onClick }: Props) {
  const isTop = rank <= 3;

  return (
    <button
      type="button"
      className={`${styles.row} ${isTop ? styles.rowTop : ""}`}
      onClick={onClick}
    >
      <div className={styles.rank}>{rank}</div>
      <div className={styles.name}>{player.name}</div>
      <div className={`${styles.right} ${styles.mono}`}>{player.rating || "—"}</div>
      <div className={`${styles.right} ${styles.mono}`}>{player.games || "—"}</div>
      <div className={`${styles.right} ${styles.mono}`}>{player.win || "—"}</div>
      <div className={`${styles.right} ${styles.mono}`}>{player.loss || "—"}</div>
      <div className={`${styles.right} ${styles.mono}`}>{player.draw || "—"}</div>
      <div className={`${styles.right} ${styles.mono}`}>{fmtPct(player.winrate)}</div>
      <div className={`${styles.right} ${styles.mono}`}>{player.peak || "—"}</div>
    </button>
  );
}
