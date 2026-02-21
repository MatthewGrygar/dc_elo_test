import type { Player } from '../../types/player';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function fmt(n: number) {
  return Math.round(n).toLocaleString('cs-CZ');
}

function buildDemoHistory(player: Player) {
  const base = player.elo - 120;
  return Array.from({ length: 10 }).map((_, i) => ({
    date: `T-${9 - i}`,
    elo: base + i * 18 + (i % 2 === 0 ? 10 : -7),
  }));
}

export function PlayerModalContent({ player, onClose }: { player: Player; onClose: () => void }) {
  const history = buildDemoHistory(player);

  return (
    <div className="playerModal">
      <div className="playerModal__head">
        <div>
          <div className="playerModal__name">{player.name}</div>
          <div className="playerModal__sub">Rank #{player.rank}</div>
        </div>

        <button className="iconBtn" type="button" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      <div className="playerModal__kpis">
        <div className="panel playerModal__kpi">
          <div className="kpi__value">{fmt(player.elo)}</div>
          <div className="kpi__label">ELO</div>
        </div>
        <div className="panel playerModal__kpi">
          <div className="kpi__value">{fmt(player.games)}</div>
          <div className="kpi__label">Games</div>
        </div>
        <div className="panel playerModal__kpi">
          <div className="kpi__value">{player.winrate ? `${player.winrate.toFixed(1)}%` : '—'}</div>
          <div className="kpi__label">Winrate</div>
        </div>
      </div>

      <div className="panel chartCard">
        <div className="chartCard__title">Výkon (placeholder trend)</div>
        <div className="chartCard__body">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={history}>
              <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 8" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fill: 'var(--text-secondary)' }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }} />
              <Line type="monotone" dataKey="elo" stroke="var(--chart-blue)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
