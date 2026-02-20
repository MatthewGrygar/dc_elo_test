import type { ReactNode } from 'react';
import type { PlayerRow } from '../types/player';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { GlassPanel } from './ui/GlassPanel';

type Props = {
  players: PlayerRow[];
};

type ChartColors = {
  accent: string;
  accent2: string;
  text: string;
  muted: string;
  grid: string;
};

function getChartColors(): ChartColors {
  // Recharts expects actual CSS colors (not CSS variables).
  // We read the CSS variables at runtime so charts match the active theme.
  if (typeof window === 'undefined') {
    return {
      accent: '#3b82f6',
      accent2: '#a855f7',
      text: '#0f172a',
      muted: '#475569',
      grid: 'rgba(148,163,184,0.35)',
    };
  }

  const styles = getComputedStyle(document.documentElement);
  const accent = `rgb(${styles.getPropertyValue('--accent').trim()})`;
  const accent2 = `rgb(${styles.getPropertyValue('--accent-2').trim()})`;
  const text = `rgb(${styles.getPropertyValue('--text').trim()})`;
  const muted = `rgb(${styles.getPropertyValue('--muted').trim()})`;
  const grid = `rgba(${styles.getPropertyValue('--border').trim()}, 0.55)`;
  return { accent, accent2, text, muted, grid };
}

function GlassTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel p-3">
      <p className="text-xs font-semibold text-[rgb(var(--muted))]">{label}</p>
      <div className="mt-1 space-y-1">
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-6 text-sm">
            <span className="text-[rgb(var(--muted))]">{p.name ?? p.dataKey}</span>
            <span className="font-semibold">{p.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  fullWidth = false,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <GlassPanel className="p-5" hover>
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold tracking-tight">{title}</h3>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">{subtitle}</p>
        </div>
      </header>
      <div className={fullWidth ? 'h-72 md:h-80' : 'h-64'}>{children}</div>
    </GlassPanel>
  );
}

/**
 * ChartsSection
 * -------------
 * Modern, glassy charts (still placeholder data in v0).
 *
 * When we later add match history we can swap these placeholders for:
 * - rating over time (per player)
 * - seasonal performance
 * - matchup matrices
 * - activity heatmaps
 */
export function ChartsSection({ players }: Props) {
  const colors = getChartColors();

  // Placeholder datasets derived from standings.
  const topByRating = [...players]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 16)
    .map((p) => ({
      name: p.name,
      rating: p.rating,
      peak: p.peak,
      winrate: Math.round((p.winrate || 0) * 1000) / 10,
      games: p.games,
    }));

  const topByGames = [...players]
    .sort((a, b) => (b.games || 0) - (a.games || 0))
    .slice(0, 10)
    .map((p) => ({ name: p.name, games: p.games, rating: p.rating }));

  const topByWinrate = [...players]
    .filter((p) => (p.games || 0) >= 5)
    .sort((a, b) => (b.winrate || 0) - (a.winrate || 0))
    .slice(0, 10)
    .map((p) => ({ name: p.name, winrate: Math.round((p.winrate || 0) * 1000) / 10 }));

  const ratingVsPeak = [...players]
    .slice(0, 22)
    .map((p) => ({ name: p.name, rating: p.rating, peak: p.peak }))
    .sort((a, b) => (b.peak || 0) - (a.peak || 0));

  const wlSplit = [...players]
    .slice(0, 12)
    .map((p) => ({ name: p.name, win: p.win, loss: p.loss, draw: p.draw }))
    .sort((a, b) => (b.win || 0) - (a.win || 0));

  return (
    <section className="mt-6 space-y-4">
      <ChartCard
        title="Top rating overview"
        subtitle="Modern area chart with soft glow + gradient fill (placeholder: top 16 by rating)."
        fullWidth
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={topByRating} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gAccent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.accent} stopOpacity={0.55} />
                <stop offset="100%" stopColor={colors.accent} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gAccent2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.accent2} stopOpacity={0.40} />
                <stop offset="100%" stopColor={colors.accent2} stopOpacity={0.02} />
              </linearGradient>
              <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <CartesianGrid stroke={colors.grid} strokeDasharray="4 10" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: colors.muted, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-12}
              height={40}
            />
            <YAxis
              tick={{ fill: colors.muted, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={42}
            />
            <Tooltip content={<GlassTooltip />} />
            <Area
              type="monotone"
              dataKey="rating"
              name="Rating"
              stroke={colors.accent}
              strokeWidth={2.5}
              fill="url(#gAccent)"
              filter="url(#softGlow)"
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="peak"
              name="Peak"
              stroke={colors.accent2}
              strokeWidth={2}
              fill="url(#gAccent2)"
              dot={false}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Most active players" subtitle="Top 10 by games played (placeholder).">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topByGames} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="barGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.accent} stopOpacity={0.70} />
                  <stop offset="100%" stopColor={colors.accent2} stopOpacity={0.30} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={colors.grid} strokeDasharray="4 10" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: colors.muted, fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: colors.muted, fontSize: 12 }} tickLine={false} axisLine={false} width={42} />
              <Tooltip content={<GlassTooltip />} />
              <Bar dataKey="games" name="Games" fill="url(#barGlow)" radius={[10, 10, 10, 10]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Best winrate (min 5 games)" subtitle="Top 10 winrate in % (placeholder).">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={topByWinrate} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid stroke={colors.grid} strokeDasharray="4 10" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: colors.muted, fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fill: colors.muted, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={42}
                domain={[0, 100]}
              />
              <Tooltip content={<GlassTooltip />} />
              <Line
                type="monotone"
                dataKey="winrate"
                name="Winrate %"
                stroke={colors.accent2}
                strokeWidth={2.5}
                dot={false}
                filter="url(#lineGlow)"
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Rating vs. peak" subtitle="How close are players to their peak (placeholder).">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ratingVsPeak} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gPeak" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.accent2} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={colors.accent2} stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={colors.grid} strokeDasharray="4 10" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: colors.muted, fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: colors.muted, fontSize: 12 }} tickLine={false} axisLine={false} width={42} />
              <Tooltip content={<GlassTooltip />} />
              <Area
                type="monotone"
                dataKey="peak"
                name="Peak"
                stroke={colors.accent2}
                strokeWidth={2.25}
                fill="url(#gPeak)"
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Area
                type="monotone"
                dataKey="rating"
                name="Rating"
                stroke={colors.accent}
                strokeWidth={2}
                fillOpacity={0}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="W/L/D split" subtitle="Wins, losses and draws (placeholder).">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={wlSplit} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={colors.grid} strokeDasharray="4 10" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: colors.muted, fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: colors.muted, fontSize: 12 }} tickLine={false} axisLine={false} width={42} />
              <Tooltip content={<GlassTooltip />} />
              <Bar dataKey="win" name="Win" fill={colors.accent} radius={[10, 10, 10, 10]} />
              <Bar dataKey="loss" name="Loss" fill={colors.accent2} radius={[10, 10, 10, 10]} />
              <Bar dataKey="draw" name="Draw" fill={colors.muted} radius={[10, 10, 10, 10]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  );
}
