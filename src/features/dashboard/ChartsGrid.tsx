import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
} from 'recharts';

type HistogramRow = { bucket: string; count: number };

function GlassTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chartTooltip panel panel--soft">
      <div className="chartTooltipTitle">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="chartTooltipRow">
          <span className="chartTooltipKey">{p.name ?? p.dataKey}</span>
          <span className="chartTooltipVal">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function noAxisLine() {
  return { stroke: 'transparent' };
}

export function ChartsGrid({
  histogram,
  scatter,
}: {
  histogram: HistogramRow[];
  scatter: { elo: number; winrate: number; name: string }[];
}) {
  // Placeholder time-series.
  const activity = React.useMemo(
    () =>
      Array.from({ length: 10 }).map((_, i) => ({
        month: `25-${String(3 + i).padStart(2, '0')}`,
        active: Math.round(70 + Math.sin(i / 1.3) * 25 + (i % 3) * 8),
      })),
    [],
  );

  const deltas = React.useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        day: i + 1,
        delta: Math.round((Math.sin(i / 2) * 40 + 25) * (i % 4 === 0 ? 0.6 : 1)),
      })),
    [],
  );

  return (
    <div className="charts" id="statistics">
      <div className="panel chartPanel chartPanel--wide">
        <div className="panelHeader">
          <div>
            <div className="panelTitle">Rating distribution</div>
            <div className="panelSub">Histogram z aktuálních standings (bucket 50)</div>
          </div>
        </div>
        <div className="chartBody">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={histogram} margin={{ top: 6, right: 12, left: 0, bottom: 18 }}>
              <XAxis
                dataKey="bucket"
                tick={{ fill: 'var(--text-2)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: 'var(--text-2)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip content={<GlassTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar
                dataKey="count"
                name="Players"
                radius={[10, 10, 10, 10]}
                fill="var(--data-primary)"
                opacity={0.92}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel chartPanel">
        <div className="panelHeader">
          <div>
            <div className="panelTitle">Active players</div>
            <div className="panelSub">Placeholder time-series</div>
          </div>
        </div>
        <div className="chartBody">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={activity} margin={{ top: 10, right: 12, left: 0, bottom: 8 }}>
              <XAxis
                dataKey="month"
                tick={{ fill: 'var(--text-2)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--text-2)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip content={<GlassTooltip />} cursor={{ stroke: 'var(--chart-grid)', strokeWidth: 1 }} />
              <Line
                type="monotone"
                dataKey="active"
                name="Players"
                stroke="var(--data-secondary)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel chartPanel">
        <div className="panelHeader">
          <div>
            <div className="panelTitle">Winrate vs ELO</div>
            <div className="panelSub">Scatter z aktuálních standings</div>
          </div>
        </div>
        <div className="chartBody">
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
              <XAxis
                dataKey="elo"
                tick={{ fill: 'var(--text-2)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                type="number"
                domain={['dataMin - 50', 'dataMax + 50']}
              />
              <YAxis
                dataKey="winrate"
                tick={{ fill: 'var(--text-2)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={28}
                type="number"
                domain={[0, 1]}
              />
              <Tooltip
                content={({ active, payload }: any) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0]?.payload;
                  return (
                    <div className="chartTooltip panel panel--soft">
                      <div className="chartTooltipTitle">{p.name}</div>
                      <div className="chartTooltipRow">
                        <span className="chartTooltipKey">ELO</span>
                        <span className="chartTooltipVal">{p.elo}</span>
                      </div>
                      <div className="chartTooltipRow">
                        <span className="chartTooltipKey">Winrate</span>
                        <span className="chartTooltipVal">{Math.round(p.winrate * 100)}%</span>
                      </div>
                    </div>
                  );
                }}
              />
              <Scatter data={scatter} fill="var(--data-positive)" opacity={0.75} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel chartPanel">
        <div className="panelHeader">
          <div>
            <div className="panelTitle">Top delta</div>
            <div className="panelSub">Placeholder delta series</div>
          </div>
        </div>
        <div className="chartBody">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={deltas} margin={{ top: 10, right: 12, left: 0, bottom: 8 }}>
              <XAxis
                dataKey="day"
                tick={{ fill: 'var(--text-2)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--text-2)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip content={<GlassTooltip />} cursor={{ stroke: 'var(--chart-grid)', strokeWidth: 1 }} />
              <Line
                type="monotone"
                dataKey="delta"
                name="ΔELO"
                stroke="var(--data-highlight)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel chartPanel">
        <div className="panelHeader">
          <div>
            <div className="panelTitle">Future slot</div>
            <div className="panelSub">Commander stats / metagame / match history</div>
          </div>
        </div>
        <div className="chartBody chartPlaceholder">
          <div className="placeholderText">Placeholder</div>
        </div>
      </div>
    </div>
  );
}
