import React from 'react';
import { X } from 'lucide-react';
import type { PlayerStanding } from '@/types/dc';

export function PlayerModal({
  player,
  onClose,
}: {
  player: PlayerStanding | null;
  onClose: () => void;
}) {
  React.useEffect(() => {
    if (!player) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [player, onClose]);

  if (!player) return null;

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modal panel">
        <div className="modalHeader">
          <div>
            <div className="modalTitle">{player.name}</div>
            <div className="modalSub">Detail hráče (placeholder)</div>
          </div>
          <button className="iconBtn" type="button" onClick={onClose} aria-label="Zavřít">
            <X size={18} />
          </button>
        </div>

        <div className="modalBody">
          <div className="modalStats">
            <div className="stat">
              <div className="statLabel">Aktuální ELO</div>
              <div className="statValue">{player.rating}</div>
            </div>
            <div className="stat">
              <div className="statLabel">Počet her</div>
              <div className="statValue">{player.games}</div>
            </div>
            <div className="stat">
              <div className="statLabel">W / L / D</div>
              <div className="statValue">
                {player.win} / {player.loss} / {player.draw}
              </div>
            </div>
            <div className="stat">
              <div className="statLabel">Winrate</div>
              <div className="statValue">{Math.round(player.winrate * 100)}%</div>
            </div>
          </div>

          <div className="modalChart panel panel--soft">
            <div className="panelTitle">Graf (coming soon)</div>
            <div className="chartPlaceholder">
              <div className="placeholderText">ELO trend / match history / opponents</div>
            </div>
          </div>
        </div>
      </div>

      <button className="modalBackdrop" onClick={onClose} aria-label="Zavřít" />
    </div>
  );
}
