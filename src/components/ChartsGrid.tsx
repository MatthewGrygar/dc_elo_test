import { Section } from "./Section";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

/**
 * Charts are placeholders with dummy data.
 * Next step: wire them to real data (Sheets/API) and define a consistent chart model.
 */
const DUMMY = Array.from({ length: 12 }).map((_, i) => ({
  month: `M${i + 1}`,
  elo: 1200 + i * 12 + (i % 3) * 18,
  games: 40 + i * 3,
  winrate: 48 + (i % 5) * 3,
}));

export function ChartsGrid() {
  return (
    <div className="grid gap-4">
      <Section
        title="Vývoj projektu (placeholder)"
        subtitle="Graf přes celou šířku • příště sem napojíme reálné metriky."
      >
        <div className="h-72 w-full">
          <ResponsiveContainer>
            <LineChart data={DUMMY}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis dataKey="month" tick={{ fill: "currentColor" }} />
              <YAxis tick={{ fill: "currentColor" }} />
              <Tooltip />
              <Line type="monotone" dataKey="elo" stroke="currentColor" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <div className="grid gap-4 md:grid-cols-2">
        <SmallChart title="Games / měsíc" kind="bar" />
        <SmallChart title="Winrate trend" kind="line" />
        <SmallChart title="Rating distribuce" kind="bar" />
        <SmallChart title="Peak vs současnost" kind="line" />
      </div>
    </div>
  );
}

function SmallChart({ title, kind }: { title: string; kind: "line" | "bar" }) {
  return (
    <Section title={title} subtitle="Placeholder graf">
      <div className="h-56 w-full">
        <ResponsiveContainer>
          {kind === "bar" ? (
            <BarChart data={DUMMY}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis dataKey="month" tick={{ fill: "currentColor" }} />
              <YAxis tick={{ fill: "currentColor" }} />
              <Tooltip />
              <Bar dataKey="games" fill="currentColor" opacity={0.35} />
            </BarChart>
          ) : (
            <LineChart data={DUMMY}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis dataKey="month" tick={{ fill: "currentColor" }} />
              <YAxis tick={{ fill: "currentColor" }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="winrate"
                stroke="currentColor"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </Section>
  );
}
