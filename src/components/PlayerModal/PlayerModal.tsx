import { createPortal } from 'react-dom';
import type { Player } from '../../types/player';
import { formatElo, formatPercent01 } from '../../utils/format';
import { useEffect, useMemo } from 'react';
import { SimpleAreaChart } from '../common/SimpleCharts';

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function PlayerModal({ player, onClose }: { player: Player | null; onClose: () => void }) {
  const isOpen = Boolean(player);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const trend = useMemo(() => {
    if (!player) return [] as number[];
    const start = Math.max(1200, player.elo - 140);
    return Array.from({ length: 18 }).map((_, i) => {
      const t = i / 17;
      const wobble = Math.sin(i / 1.9) * 12;
      return Math.round(start + (player.elo - start) * t + wobble);
    });
  }, [player]);

  if (!isOpen || !player) return null;

  return createPortal(
    <div className="modal" role="dialog" aria-modal="true" aria-label="Detail hráče">
      <button className="modal__backdrop" type="button" onClick={onClose} aria-label="Zavřít" />

      <div className="modal__panel panel">
        <div className="modal__header">
          <div>
            <div className="modal__title">{player.name}</div>
            <div className="modal__subtitle">Detail hráče</div>
          </div>
          <button className="iconBtn" type="button" onClick={onClose} aria-label="Zavřít">
            <CloseIcon />
          </button>
        </div>

        <div className="modal__kpis">
          <div className="miniKpi">
            <div className="miniKpi__label">ELO</div>
            <div className="miniKpi__value" style={{ color: 'var(--accent-1)' }}>
              {formatElo(player.elo)}
            </div>
          </div>
          <div className="miniKpi">
            <div className="miniKpi__label">Games</div>
            <div className="miniKpi__value">{player.games}</div>
          </div>
          <div className="miniKpi">
            <div className="miniKpi__label">Winrate</div>
            <div className="miniKpi__value">{formatPercent01(player.winrate)}</div>
          </div>
          <div className="miniKpi">
            <div className="miniKpi__label">Peak</div>
            <div className="miniKpi__value">{formatElo(player.peak)}</div>
          </div>
        </div>

        <div className="panel chart">
          <div className="chart__header">
            <div className="chart__title">Výkon v čase (placeholder)</div>
            <div className="chart__hint">Připraveno pro napojení na historii ELO</div>
          </div>
          <div className="chart__body">
            <SimpleAreaChart values={trend} height={220} />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
