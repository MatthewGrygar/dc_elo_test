import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styles from "./dashboard.module.css";

/**
 * Charts are placeholders with demo data.
 * We already use Recharts so swapping to real datasets is straightforward.
 */
const demo = Array.from({ length: 12 }).map((_, i) => ({
  week: `W${i + 1}`,
  eloAvg: 1600 + Math.round(Math.sin(i / 2) * 60 + i * 8),
  matches: 20 + Math.round(Math.cos(i / 2) * 6 + i * 2),
  winrate: 45 + Math.round(Math.sin(i / 3) * 8 + i * 0.2),
}));

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={`${styles.chartCard} panel`}>
      <div className={styles.chartHeader}>
        <div className={styles.chartTitle}>{title}</div>
        <div className="muted" style={{ fontSize: 12 }}>
          demo
        </div>
      </div>
      <div className={styles.chartBody}>{children}</div>
    </div>
  );
}

export function ChartsGrid() {
  return (
    <div style={{ marginTop: 16 }}>
      {/* Full width chart */}
      <Card title="ELO trend (average)">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={demo} margin={{ left: 6, right: 18, top: 10, bottom: 10 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.10)" vertical={false} />
            <XAxis dataKey="week" stroke="rgba(255,255,255,0.35)" />
            <YAxis stroke="rgba(255,255,255,0.35)" />
            <Tooltip />
            <Line type="monotone" dataKey="eloAvg" stroke="var(--data-primary)" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* 4 charts: 2x2 */}
      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <Card title="Matches / week">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={demo} margin={{ left: 6, right: 18, top: 10, bottom: 10 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.10)" vertical={false} />
              <XAxis dataKey="week" stroke="rgba(255,255,255,0.35)" />
              <YAxis stroke="rgba(255,255,255,0.35)" />
              <Tooltip />
              <Area type="monotone" dataKey="matches" stroke="var(--data-secondary)" fill="rgba(139,92,246,0.25)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Winrate (avg)">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={demo} margin={{ left: 6, right: 18, top: 10, bottom: 10 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.10)" vertical={false} />
              <XAxis dataKey="week" stroke="rgba(255,255,255,0.35)" />
              <YAxis stroke="rgba(255,255,255,0.35)" domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="winrate" stroke="var(--data-positive)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Secondary dataset">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={demo} margin={{ left: 6, right: 18, top: 10, bottom: 10 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.10)" vertical={false} />
              <XAxis dataKey="week" stroke="rgba(255,255,255,0.35)" />
              <YAxis stroke="rgba(255,255,255,0.35)" />
              <Tooltip />
              <Area type="monotone" dataKey="eloAvg" stroke="var(--data-highlight)" fill="rgba(251,191,36,0.18)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Another metric">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={demo} margin={{ left: 6, right: 18, top: 10, bottom: 10 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.10)" vertical={false} />
              <XAxis dataKey="week" stroke="rgba(255,255,255,0.35)" />
              <YAxis stroke="rgba(255,255,255,0.35)" />
              <Tooltip />
              <Line type="monotone" dataKey="matches" stroke="var(--data-negative)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
