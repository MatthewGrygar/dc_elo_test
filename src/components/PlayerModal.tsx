import React from 'react';
import type { PlayerRow } from '../types/player';

export function PlayerModal({ player, onClose }: { player: PlayerRow | null; onClose: () => void }) {
  React.useEffect(() => {
    if (!player) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [player, onClose]);

  if (!player) return null;

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true" aria-label="Player details">
      <button className="modalBackdrop" onClick={onClose} aria-label="Close" type="button" />

      <div className="modal panel">
        <div className="modalHeader">
          <div>
            <div className="chip">Player</div>
            <h3 className="modalTitle">{player.name}</h3>
          </div>
          <button className="btn btn--ghost" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <div className="modalBody">
          <div className="modalStats">
            <Stat label="Rating" value={String(player.rating)} accent />
            <Stat label="Peak" value={String(player.peak)} />
            <Stat label="Games" value={String(player.games)} />
            <Stat label="W / L / D" value={`${player.win} / ${player.loss} / ${player.draw}`} />
            <Stat label="Winrate" value={player.winrate ? `${round(player.winrate)}%` : '—'} />
          </div>

          <div className="panel panel--soft modalChart">
            <div className="chartPlaceholder">
              <div className="chartPlaceholderTitle">Player analytics (placeholder)</div>
              <div className="muted">Next: rating history, commander stats, match history.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={accent ? 'panel statCard isAccent' : 'panel statCard'}>
      <div className="muted statLabel">{label}</div>
      <div className="statValue mono">{value}</div>
    </div>
  );
}

function round(n: number) {
  return Math.round(n * 10) / 10;
}
