import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Player } from "../../types/player";

/**
 * Charts are currently placeholders.
 *
 * Goal for this iteration:
 * - establish layout + consistent card styling
 * - prove the chart library works in GH Pages
 *
 * Later:
 * - swap mock series for real match history / time series
 * - add filters, smoothing, deltas, meta insights
 */
type Point = { label: string; value: number; value2?: number };

function makeMockSeries(players: Player[]): Point[] {
  const top = players.slice(0, 8);
  const base = top.reduce((acc, p) => acc + p.rating, 0) / Math.max(1, top.length);

  // Generate a stable-ish synthetic curve based on current data
  const points: Point[] = [];
  for (let i = 0; i < 14; i++) {
    const wave = Math.sin(i / 2.1) * 18;
    const drift = i * 2.6;
    points.push({
      label: `W${i + 1}`,
      value: Math.round(base + wave + drift),
      value2: Math.round(base - 25 + Math.cos(i / 2.3) * 14 + drift / 2),
    });
  }
  return points;
}

export function ChartsGrid({ players }: { players: Player[] }) {
  const series = makeMockSeries(players);

  return (
    <div id="charts" className="chartsWrap">
      <div className="panel chartCard chartCard--wide">
        <div className="chartHeader">
          <div>
            <div className="chartTitle">ELO Trend (placeholder)</div>
            <div className="chartHint">Syntetická časová řada — napojíme na real data později.</div>
          </div>
          <div className="chip chip--accent">Primary data</div>
        </div>

        <div className="chartBody">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={46} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" name="Top pool" stroke="var(--data-primary)" dot={false} />
              <Line type="monotone" dataKey="value2" name="Secondary" stroke="var(--data-secondary)" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chartsGrid">
        <div className="panel chartCard">
          <div className="chartHeader">
            <div>
              <div className="chartTitle">Winrate Distribution</div>
              <div className="chartHint">Placeholder — napojíme na real data.</div>
            </div>
          </div>
          <div className="chartBody">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={series}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={46} />
                <Tooltip />
                <Area type="monotone" dataKey="value" name="Winrate" stroke="var(--data-positive)" fill="var(--data-positive)" fillOpacity={0.12} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel chartCard">
          <div className="chartHeader">
            <div>
              <div className="chartTitle">Games Volume</div>
              <div className="chartHint">Placeholder — agregace podle týdne.</div>
            </div>
          </div>
          <div className="chartBody">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={series}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={46} />
                <Tooltip />
                <Area type="monotone" dataKey="value2" name="Games" stroke="var(--data-primary)" fill="var(--data-primary)" fillOpacity={0.12} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel chartCard">
          <div className="chartHeader">
            <div>
              <div className="chartTitle">Top Delta</div>
              <div className="chartHint">Placeholder — změna ratingu.</div>
            </div>
          </div>
          <div className="chartBody">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={46} />
                <Tooltip />
                <Line type="monotone" dataKey="value" name="Δ" stroke="var(--data-highlight)" dot={false} />
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
