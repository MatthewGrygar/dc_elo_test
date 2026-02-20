import type { PlayerRow } from '../types/player';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function panelClassName() {
  return 'rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))]/60 p-5 shadow-soft backdrop-blur';
}

function toChartColors() {
  // Recharts prefers actual colors; we use the CSS vars here.
  const styles = getComputedStyle(document.documentElement);
  const accent = `rgb(${styles.getPropertyValue('--accent').trim()})`;
  const accent2 = `rgb(${styles.getPropertyValue('--accent-2').trim()})`;
  const text = `rgb(${styles.getPropertyValue('--text').trim()})`;
  const muted = `rgb(${styles.getPropertyValue('--muted').trim()})`;
  const grid = `rgba(${styles.getPropertyValue('--border').trim()}, 0.65)`;
  return { accent, accent2, text, muted, grid };
}

type Props = {
  players: PlayerRow[];
};

/**
 * Charts are intentionally simple in v0.
 *
 * The real value comes once we add:
 * - match history (time series)
 * - rating deltas
 * - activity tracking
 */
export function ChartsSection({ players }: Props) {
  const top10 = players.slice(0, 10).map((p) => ({ name: p.name, rating: p.rating }));

  const ratingBuckets = bucketRatings(players, 100).map((b) => ({
    bucket: b.label,
    players: b.count,
  }));

  const winLoss = players.slice(0, 12).map((p) => ({
    name: p.name,
    win: p.win,
    loss: p.loss,
    draw: p.draw,
  }));

  const gamesVsRating = players.slice(0, 40).map((p) => ({
    name: p.name,
    games: p.games,
    rating: p.rating,
  }));

  // Get palette lazily (needs DOM) – safe in browser only.
  const colors = typeof window !== 'undefined' ? toChartColors() : null;

  return (
    <section className="space-y-4">
      <div className={panelClassName()}>
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-bold tracking-tight">Distribuce ratingu</h2>
          <p className="text-sm text-[rgb(var(--muted))]">Placeholder: bucketed histogram</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ratingBuckets} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid stroke={colors?.grid} strokeDasharray="4 4" />
              <XAxis dataKey="bucket" tick={{ fill: colors?.muted }} />
              <YAxis tick={{ fill: colors?.muted }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(0,0,0,0.65)',
                  borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white',
                }}
              />
              <Area
                type="monotone"
                dataKey="players"
                stroke={colors?.accent}
                fill={colors?.accent}
                fillOpacity={0.25}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={panelClassName()}>
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h3 className="text-base font-bold tracking-tight">Top 10 rating</h3>
            <p className="text-sm text-[rgb(var(--muted))]">Placeholder</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top10} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid stroke={colors?.grid} strokeDasharray="4 4" />
                <XAxis dataKey="name" tick={{ fill: colors?.muted }} hide />
                <YAxis tick={{ fill: colors?.muted }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(0,0,0,0.65)',
                    borderRadius: 16,
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'white',
                  }}
                />
                <Bar dataKey="rating" fill={colors?.accent2} radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={panelClassName()}>
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h3 className="text-base font-bold tracking-tight">Win/Loss/Draw (top 12)</h3>
            <p className="text-sm text-[rgb(var(--muted))]">Placeholder</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={winLoss} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid stroke={colors?.grid} strokeDasharray="4 4" />
                <XAxis dataKey="name" tick={{ fill: colors?.muted }} hide />
                <YAxis tick={{ fill: colors?.muted }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(0,0,0,0.65)',
                    borderRadius: 16,
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'white',
                  }}
                />
                <Legend wrapperStyle={{ color: colors?.muted }} />
                <Bar dataKey="win" stackId="a" fill={colors?.accent} radius={[0, 0, 0, 0]} />
                <Bar dataKey="draw" stackId="a" fill={colors?.accent2} radius={[0, 0, 0, 0]} />
                <Bar dataKey="loss" stackId="a" fill={colors?.text} opacity={0.25} radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={panelClassName()}>
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h3 className="text-base font-bold tracking-tight">Games vs Rating</h3>
            <p className="text-sm text-[rgb(var(--muted))]">Placeholder</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gamesVsRating} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid stroke={colors?.grid} strokeDasharray="4 4" />
                <XAxis dataKey="name" tick={{ fill: colors?.muted }} hide />
                <YAxis yAxisId="left" tick={{ fill: colors?.muted }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: colors?.muted }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(0,0,0,0.65)',
                    borderRadius: 16,
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'white',
                  }}
                />
                <Legend wrapperStyle={{ color: colors?.muted }} />
                <Line yAxisId="left" type="monotone" dataKey="games" stroke={colors?.accent} strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="rating" stroke={colors?.accent2} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={panelClassName()}>
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h3 className="text-base font-bold tracking-tight">TODO: Rating over time</h3>
            <p className="text-sm text-[rgb(var(--muted))]">Placeholder for match history</p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={players.slice(0, 12).map((p, i) => ({ x: i + 1, rating: p.rating }))}
                margin={{ left: 0, right: 10, top: 10, bottom: 0 }}
              >
                <CartesianGrid stroke={colors?.grid} strokeDasharray="4 4" />
                <XAxis dataKey="x" tick={{ fill: colors?.muted }} />
                <YAxis tick={{ fill: colors?.muted }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(0,0,0,0.65)',
                    borderRadius: 16,
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'white',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rating"
                  stroke={colors?.accent}
                  fill={colors?.accent}
                  fillOpacity={0.18}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

function bucketRatings(players: PlayerRow[], step: number) {
  const ratings = players.map((p) => p.rating).filter((n) => Number.isFinite(n));
  if (ratings.length === 0) return [] as { label: string; count: number }[];

  const min = Math.floor(Math.min(...ratings) / step) * step;
  const max = Math.ceil(Math.max(...ratings) / step) * step;

  const buckets: { label: string; count: number; from: number; to: number }[] = [];
  for (let from = min; from < max; from += step) {
    const to = from + step;
    buckets.push({
      from,
      to,
      label: `${from}–${to}`,
      count: 0,
    });
  }

  for (const r of ratings) {
    const idx = Math.min(Math.floor((r - min) / step), buckets.length - 1);
    if (idx >= 0) buckets[idx]!.count += 1;
  }

  return buckets;
}
