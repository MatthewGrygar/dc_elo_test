import { useEffect } from "react";
import ReactDOM from "react-dom";
import type { PlayerRow } from "../../types/player";
import styles from "./leaderboard.module.css";

type Props = {
  player: PlayerRow;
  onClose: () => void;
};

/**
 * PlayerModal — placeholder detail view.
 * Later: player history chart, commander distribution, match list.
 */
export function PlayerModal({ player, onClose }: Props) {
  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const root = document.getElementById("modal-root");
  if (!root) return null;

  return ReactDOM.createPortal(
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modal" aria-label={`Player ${player.name}`}>
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.modalTitle}>{player.name}</div>
            <div className="muted" style={{ fontSize: 13 }}>
              Detail bude doplněn (grafy, historie zápasů, meta stats)
            </div>
          </div>
          <button className={styles.closeBtn} type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={`${styles.bigStat} panel panel--soft`}>
            <div className="muted" style={{ fontSize: 12 }}>
              Rating
            </div>
            <div style={{ fontSize: 34, fontWeight: 950, letterSpacing: "-0.03em" }}>
              {player.rating || "—"}
            </div>
          </div>

          <div className="grid grid-2" style={{ marginTop: 14 }}>
            <div className={`${styles.placeholder} panel`}>
              <div className={styles.placeholderTitle}>Chart placeholder</div>
              <div className="muted" style={{ fontSize: 12 }}>
                (ELO over time)
              </div>
            </div>
            <div className={`${styles.placeholder} panel`}>
              <div className={styles.placeholderTitle}>Stats placeholder</div>
              <div className="muted" style={{ fontSize: 12 }}>
                (win/loss/draw, peak, commanders)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    root,
  );
}
