import type { PlayerRow } from '../types/player';
import { Swords, TrendingUp, Trophy, Users } from 'lucide-react';
import { GlassPanel } from './ui/GlassPanel';

function formatPct(v: number) {
  if (!Number.isFinite(v)) return '—';
  return `${Math.round(v * 1000) / 10}%`;
}

type Props = {
  players: PlayerRow[];
};

/**
 * StatsBar
 * -------
 * "Hero" micro-cards showing quick project metrics.
 *
 * Notes for future development:
 * - These are derived from the standings sheet (no match history yet).
 * - Once we add per-match data, we can extend this section with streaks,
 *   activity over time, and performance vs. opponents.
 */
export function StatsBar({ players }: Props) {
  const totalPlayers = players.length;
  const totalGames = players.reduce((sum, p) => sum + (p.games || 0), 0);

  const top = players[0];
  const bestWinrate = [...players].sort((a, b) => (b.winrate || 0) - (a.winrate || 0))[0];

  const cards = [
    {
      label: 'Players',
      value: totalPlayers.toString(),
      icon: Users,
    },
    {
      label: 'Total games',
      value: totalGames.toString(),
      icon: Swords,
    },
    {
      label: 'Current #1',
      value: top ? top.name : '—',
      icon: Trophy,
    },
    {
      label: 'Best winrate',
      value: bestWinrate ? formatPct(bestWinrate.winrate) : '—',
      icon: TrendingUp,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-4">
      {cards.map((c) => (
        <GlassPanel key={c.label} className="p-5" hover>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-[rgb(var(--muted))]">{c.label}</p>
              <p className="mt-2 text-lg font-bold tracking-tight">{c.value}</p>
            </div>

            <div className="glass-chip p-2">
              <c.icon size={18} />
            </div>
          </div>
        </GlassPanel>
      ))}
    </section>
  );
}
