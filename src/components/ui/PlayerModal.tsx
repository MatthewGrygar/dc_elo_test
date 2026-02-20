import { useEffect } from "react";
import { Player } from "../../types/player";
import { formatInt, formatPct } from "../../lib/format";

export function PlayerModal({ player, onClose }: { player: Player | null; onClose: () => void }) {
  // Escape closes modal
  useEffect(() => {
    if (!player) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [player, onClose]);

  if (!player) return null;

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true" aria-label="Player details">
      <div className="modal panel">
        <div className="modalHeader">
          <div>
            <div className="modalTitle">{player.name}</div>
            <div className="modalSub">Detail hráče (placeholder)</div>
          </div>
          <button className="modalClose" onClick={onClose} type="button" aria-label="Zavřít">
            ×
          </button>
        </div>

        <div className="modalBody">
          <div className="modalGrid">
            <div className="panel card card--tight">
              <div className="cardTitle">Rating</div>
              <div className="cardValue">{formatInt(player.rating)}</div>
              <div className="cardHint">Aktuální ELO</div>
            </div>
            <div className="panel card card--tight">
              <div className="cardTitle">Peak</div>
              <div className="cardValue">{formatInt(player.peak)}</div>
              <div className="cardHint">Nejvyšší dosažený rating</div>
            </div>
            <div className="panel card card--tight">
              <div className="cardTitle">Winrate</div>
              <div className="cardValue">{formatPct(player.winrate)}</div>
              <div className="cardHint">W/L/D záznam</div>
            </div>
            <div className="panel card card--tight">
              <div className="cardTitle">Games</div>
              <div className="cardValue">{formatInt(player.games)}</div>
              <div className="cardHint">Počet odehraných her</div>
            </div>
          </div>

          <div className="panel chartCard">
            <div className="chartHeader">
              <div>
                <div className="chartTitle">Player chart (placeholder)</div>
                <div className="chartHint">Sem později přidáme historii zápasů + ELO křivku.</div>
              </div>
            </div>
            <div className="chartBody">
              <div className="chartPlaceholder">
                <div className="placeholderLine" />
                <div className="placeholderLine" />
                <div className="placeholderLine" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <button className="modalBackdrop" onClick={onClose} type="button" aria-label="Close modal" />
    </div>
  );
}
