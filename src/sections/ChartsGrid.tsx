import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart
} from 'recharts';
import type React from 'react';
import type { PlayerRow } from '../types/player';

export function ChartsGrid({ players }: { players: PlayerRow[] }) {
  const top10 = players.slice(0, 10);

  const ratingData = top10.map((p) => ({ name: shortName(p.name), rating: p.rating, peak: p.peak }));
  const wlData = top10.map((p) => ({ name: shortName(p.name), win: p.win, loss: p.loss, draw: p.draw }));
  const wrData = top10.map((p) => ({ name: shortName(p.name), winrate: p.winrate }));
  const gamesData = top10.map((p) => ({ name: shortName(p.name), games: p.games }));

  return (
    <section id="stats" className="stack-lg" aria-label="Charts">
      <div className="chartsGrid">
        <ChartCard title="Top players — Rating vs Peak" size="wide">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={ratingData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 8" opacity={0.18} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} height={60} angle={-20} />
              <YAxis tick={{ fontSize: 12 }} width={42} />
              <Tooltip />
              <Line type="monotone" dataKey="rating" stroke="var(--data-primary)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="peak" stroke="var(--data-secondary)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Wins / Losses / Draws" subtitle="Top 10 sample">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={wlData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 8" opacity={0.18} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} height={60} angle={-20} />
              <YAxis tick={{ fontSize: 12 }} width={42} />
              <Tooltip />
              <Bar dataKey="win" fill="var(--data-positive)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="loss" fill="var(--data-negative)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="draw" fill="var(--data-highlight)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Winrate" subtitle="%">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={wrData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 8" opacity={0.18} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} height={60} angle={-20} />
              <YAxis tick={{ fontSize: 12 }} width={42} domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="winrate" stroke="var(--data-primary)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Games played" subtitle="Top 10 sample">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={gamesData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 8" opacity={0.18} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} height={60} angle={-20} />
              <YAxis tick={{ fontSize: 12 }} width={42} />
              <Tooltip />
              <Bar dataKey="games" fill="var(--data-secondary)" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Placeholder" subtitle="Reserved for Metagame">
          <div className="chartPlaceholder">
            <div className="chartPlaceholderTitle">Metagame</div>
            <div className="muted">Next: commander popularity, archetypes, matchups.</div>
          </div>
        </ChartCard>
      </div>
    </section>
  );
}

function ChartCard({
  title,
  subtitle,
  size,
  children
}: {
  title: string;
  subtitle?: string;
  size?: 'wide';
  children: React.ReactNode;
}) {
  return (
    <div className={size === 'wide' ? 'panel chartCard isWide' : 'panel chartCard'}>
      <div className="chartHeader">
        <div>
          <div className="chartTitle">{title}</div>
          {subtitle ? <div className="chartSubtitle muted">{subtitle}</div> : null}
        </div>
        <div className="badge">Placeholder</div>
      </div>
      {children}
    </div>
  );
}

function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  return `${parts[0]} ${parts[1]![0]}.`;
}
