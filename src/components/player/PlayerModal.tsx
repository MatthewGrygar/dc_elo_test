import React, { useMemo } from 'react';
import type { Player } from '../../types/player';
import { Modal } from '../common/Modal';
import { formatNumber } from '../../utils/format';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

export function PlayerModal({ player, onClose }: { player: Player | null; onClose: () => void }) {
  const data = useMemo(() => {
    if (!player) return [];

    // Placeholder sparkline: simulate small variation around current elo.
    const base = player.elo;
    return Array.from({ length: 14 }, (_, i) => {
      const wobble = Math.sin(i / 2) * 22 + (i % 3 === 0 ? 9 : -6);
      return { game: i + 1, elo: Math.round(base + wobble) };
    });
  }, [player]);

  return (
    <Modal isOpen={!!player} title={player ? player.name : 'Player'} onClose={onClose}>
      {player ? (
        <div className="playerModal">
          <div className="playerModal__hero">
            <div>
              <div className="playerModal__kicker">Aktuální ELO</div>
              <div className="playerModal__elo">{formatNumber(player.elo)}</div>
              <div className="playerModal__meta">
                Rank #{player.rank} · {formatNumber(player.games)} her · Winrate{' '}
                {formatNumber(Math.round(player.winrate * 100))}%
              </div>
            </div>

            <div className="playerModal__stats">
              <div className="stat">
                <div className="stat__label">W</div>
                <div className="stat__value">{formatNumber(player.wins)}</div>
              </div>
              <div className="stat">
                <div className="stat__label">L</div>
                <div className="stat__value">{formatNumber(player.losses)}</div>
              </div>
              <div className="stat">
                <div className="stat__label">D</div>
                <div className="stat__value">{formatNumber(player.draws)}</div>
              </div>
              <div className="stat">
                <div className="stat__label">Peak</div>
                <div className="stat__value">{formatNumber(player.peak)}</div>
              </div>
            </div>
          </div>

          <div className="playerModal__chart">
            <div className="chart__title">Výkon (placeholder)</div>
            <div className="chart__body">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data} margin={{ top: 10, left: 4, right: 16, bottom: 6 }}>
                  <CartesianGrid vertical={false} strokeOpacity={0.15} />
                  <XAxis dataKey="game" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={38} domain={['dataMin - 40', 'dataMax + 40']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="elo" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
