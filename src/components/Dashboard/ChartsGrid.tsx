import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

function ChartFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="chart">
      <div className="chart__title">{title}</div>
      <div className="chart__body">{children}</div>
    </div>
  );
}

export function ChartsGrid({
  data,
  isLoading
}: {
  data: {
    eloBars: { name: string; elo: number }[];
    winrateBars: { name: string; winrate: number }[];
    distribution: { bucket: string; players: number }[];
    gamesBars: { name: string; games: number }[];
    syntheticTrend: { week: string; games: number }[];
  };
  isLoading: boolean;
}) {
  if (isLoading) {
    return <div className="chartsGrid">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="chart chart--skeleton" />)}</div>;
  }

  return (
    <div className="chartsGrid" id="statistics">
      <div className="chartsGrid__wide">
        <ChartFrame title="Trend: hry za období (syntetický placeholder)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.syntheticTrend} margin={{ top: 10, left: 4, right: 16, bottom: 6 }}>
              <CartesianGrid vertical={false} strokeOpacity={0.15} />
              <XAxis dataKey="week" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={38} />
              <Tooltip />
              <Line type="monotone" dataKey="games" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartFrame>
      </div>

      <ChartFrame title="Top 10: ELO">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data.eloBars} margin={{ top: 6, left: 4, right: 16, bottom: 10 }}>
            <CartesianGrid vertical={false} strokeOpacity={0.15} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} hide />
            <YAxis tickLine={false} axisLine={false} width={38} />
            <Tooltip />
            <Bar dataKey="elo" />
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame title="Top 10: Winrate %">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data.winrateBars} margin={{ top: 6, left: 4, right: 16, bottom: 10 }}>
            <CartesianGrid vertical={false} strokeOpacity={0.15} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} hide />
            <YAxis tickLine={false} axisLine={false} width={38} />
            <Tooltip />
            <Bar dataKey="winrate" />
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame title="Rozdělení ELO">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data.distribution} margin={{ top: 6, left: 4, right: 16, bottom: 10 }}>
            <CartesianGrid vertical={false} strokeOpacity={0.15} />
            <XAxis dataKey="bucket" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={38} />
            <Tooltip />
            <Bar dataKey="players" />
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame title="Top 10: odehrané hry">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data.gamesBars} margin={{ top: 6, left: 4, right: 16, bottom: 10 }}>
            <CartesianGrid vertical={false} strokeOpacity={0.15} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} hide />
            <YAxis tickLine={false} axisLine={false} width={38} />
            <Tooltip />
            <Bar dataKey="games" />
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>
    </div>
  );
}
