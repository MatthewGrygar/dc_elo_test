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
} from "recharts";
import { Player } from "../../types/player";

type Point = { label: string; value: number; value2?: number };

function makeMockSeries(players: Player[]): Point[] {
  const top = players.slice(0, 8);
  const base = top.reduce((acc, p) => acc + p.rating, 0) / Math.max(1, top.length);

  const points: Point[] = [];
  for (let i = 0; i < 14; i++) {
    const wave = Math.sin(i / 2.1) * 18;
    const drift = i * 2.6;
    points.push({
      label: `W${i + 1}`,
      value: Math.round(base + wave + drift),
      value2: Math.round(42 + Math.cos(i / 2.2) * 10 + i * 1.4),
    });
  }
  return points;
}

const axis = {
  tickLine: false,
  axisLine: false,
  tick: { fill: "var(--tick)", fontSize: 12 },
} as const;

const tooltipStyle = {
  background: "var(--panel-bg)",
  border: "1px solid var(--panel-border)",
  borderRadius: 14,
  color: "var(--text)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
} as const;

export function ChartsGrid({ players }: { players: Player[] }) {
  const series = makeMockSeries(players);

  return (
    <div id="charts" className="chartsWrap">
      <div className="panel chartCard chartCard--wide">
        <div className="chartHeader">
          <div>
            <div className="chartTitle">ELO Trend (placeholder)</div>
            <div className="chartHint">Syntetická časová řada — real data doplníme později.</div>
          </div>
          <div className="chip chip--accent">Primary</div>
        </div>

        <div className="chartBody">
          <ResponsiveContainer width="100%" height={330}>
            <LineChart data={series} margin={{ top: 8, right: 12, left: 2, bottom: 4 }}>
              <defs>
                <filter id="glowPrimary" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2.4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="glowSecondary" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2.0" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <CartesianGrid stroke="var(--chart-grid)" strokeOpacity={0.6} vertical={false} />
              <XAxis dataKey="label" {...axis} />
              <YAxis {...axis} width={44} />
              <Tooltip cursor={{ stroke: "var(--chart-grid)" }} contentStyle={tooltipStyle} />

              <Line
                type="monotone"
                dataKey="value"
                name="Top pool"
                stroke="var(--data-primary)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                filter="url(#glowPrimary)"
              />
              <Line
                type="monotone"
                dataKey="value2"
                name="Secondary"
                stroke="var(--data-secondary)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                filter="url(#glowSecondary)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chartsGrid">
        <div className="panel chartCard">
          <div className="chartHeader">
            <div>
              <div className="chartTitle">Winrate Distribution</div>
              <div className="chartHint">Placeholder — vizuál připravený na real data.</div>
            </div>
          </div>
          <div className="chartBody">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={series} margin={{ top: 6, right: 12, left: 2, bottom: 4 }}>
                <defs>
                  <linearGradient id="gradWin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--data-positive)" stopOpacity={0.24} />
                    <stop offset="100%" stopColor="var(--data-positive)" stopOpacity={0.04} />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="var(--chart-grid)" strokeOpacity={0.5} vertical={false} />
                <XAxis dataKey="label" {...axis} />
                <YAxis {...axis} width={44} />
                <Tooltip cursor={{ stroke: "var(--chart-grid)" }} contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Winrate"
                  stroke="var(--data-positive)"
                  strokeWidth={2}
                  fill="url(#gradWin)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel chartCard">
          <div className="chartHeader">
            <div>
              <div className="chartTitle">Games Volume</div>
              <div className="chartHint">Sloupce — rounded + gradient, glass tooltip.</div>
            </div>
          </div>
          <div className="chartBody">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={series} margin={{ top: 6, right: 12, left: 2, bottom: 4 }}>
                <defs>
                  <linearGradient id="gradBars" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--data-primary)" stopOpacity={0.52} />
                    <stop offset="100%" stopColor="var(--data-secondary)" stopOpacity={0.18} />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="var(--chart-grid)" strokeOpacity={0.45} vertical={false} />
                <XAxis dataKey="label" {...axis} />
                <YAxis {...axis} width={44} />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.02)" }} contentStyle={tooltipStyle} />
                <Bar dataKey="value2" name="Games" fill="url(#gradBars)" radius={[10, 10, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel chartCard">
          <div className="chartHeader">
            <div>
              <div className="chartTitle">Top Delta</div>
              <div className="chartHint">Placeholder — tlumený highlight.</div>
            </div>
          </div>
          <div className="chartBody">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={series} margin={{ top: 8, right: 12, left: 2, bottom: 4 }}>
                <defs>
                  <filter id="glowHighlight" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2.2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <CartesianGrid stroke="var(--chart-grid)" strokeOpacity={0.6} vertical={false} />
                <XAxis dataKey="label" {...axis} />
                <YAxis {...axis} width={44} />
                <Tooltip cursor={{ stroke: "var(--chart-grid)" }} contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Δ"
                  stroke="var(--data-highlight)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  filter="url(#glowHighlight)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel chartCard">
          <div className="chartHeader">
            <div>
              <div className="chartTitle">Meta Signal</div>
              <div className="chartHint">Placeholder — budoucí metagame modul.</div>
            </div>
          </div>
          <div className="chartBody">
            <div className="chartPlaceholder">
              <div className="placeholderLine" />
              <div className="placeholderLine" />
              <div className="placeholderLine" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
