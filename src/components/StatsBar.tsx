import type { PlayerRow } from '../types/player';
import { Trophy, Users, Swords, TrendingUp } from 'lucide-react';

function formatPct(v: number) {
  if (!Number.isFinite(v)) return '—';
  return `${Math.round(v * 1000) / 10}%`;
}

type Props = {
  players: PlayerRow[];
};

/**
 * Small "top stats" row.
 *
 * For now we compute few derived stats from the standings table.
 * Later we can extend this into a richer dashboard (weekly activity, streaks, etc.).
 */
export function StatsBar({ players }: Props) {
  const totalPlayers = players.length;
  const totalGames = players.reduce((sum, p) => sum + (p.games || 0), 0);

  const top = players[0];
  const bestWinrate = [...players].sort((a, b) => b.winrate - a.winrate)[0];

  const cards = [
    {
      label: 'Hráčů v žebříčku',
      value: String(totalPlayers),
      icon: Users,
    },
    {
      label: 'Zápasů celkem',
      value: String(totalGames),
      icon: Swords,
    },
    {
      label: 'Lídr ratingu',
      value: top ? `${top.name} (${Math.round(top.rating)})` : '—',
      icon: Trophy,
    },
    {
      label: 'Nejlepší winrate',
      value: bestWinrate ? `${bestWinrate.name} (${formatPct(bestWinrate.winrate)})` : '—',
      icon: TrendingUp,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))]/60 p-5 shadow-soft backdrop-blur"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-[rgb(var(--muted))]">{c.label}</p>
              <p className="mt-2 text-lg font-bold tracking-tight">{c.value}</p>
            </div>
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))]/60 p-2">
              <c.icon size={18} />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
