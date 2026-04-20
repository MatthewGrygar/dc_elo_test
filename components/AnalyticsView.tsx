"use client";

import { useEffect, useState } from "react";
import { useRatingMode } from "./RatingModeProvider";
import { useRegion } from "./RegionProvider";
import { useAppNav } from "./AppContext";
import { AnalyticsData } from "@/lib/dataFetchers";
import type { PrefetchCache } from "@/app/page";
import { t, Lang } from "@/lib/i18n";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, ScatterChart, Scatter, Cell,
  ReferenceLine, PieChart, Pie, Legend, ComposedChart,
} from "recharts";

// ─── Shared ────────────────────────────────────────────────────────────────────
function GlassCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", ...style }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0, background: "hsl(var(--card) / 0.88)", backdropFilter: "blur(16px) saturate(150%)", WebkitBackdropFilter: "blur(16px) saturate(150%)", border: "1px solid hsl(var(--card-border) / 0.85)", borderRadius: 14 }} />
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>{children}</div>
    </div>
  );
}

function CH({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ padding: "14px 18px 0", flexShrink: 0 }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "hsl(var(--foreground))" }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", marginTop: 2, fontFamily: "var(--font-mono)" }}>{sub}</div>}
    </div>
  );
}

const CT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: 11 }}>
      {label !== undefined && <div style={{ color: "hsl(var(--muted-foreground))", marginBottom: 2 }}>{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color ?? "hsl(var(--primary))", fontWeight: 600 }}>{p.name !== undefined ? `${p.name}: ` : ""}{typeof p.value === "number" ? p.value.toLocaleString("cs-CZ") : p.value}</div>
      ))}
    </div>
  );
};

const PIE_COLORS = ["hsl(152,65%,50%)","hsl(210,70%,55%)","hsl(42,80%,55%)","hsl(265,65%,60%)","hsl(0,65%,55%)","hsl(185,65%,50%)","hsl(320,60%,55%)","hsl(45,90%,55%)","hsl(180,60%,50%)","hsl(30,80%,55%)","hsl(280,60%,58%)","hsl(60,70%,50%)"];

function Sk({ h = 200 }: { h?: number }) {
  return <div style={{ height: h, borderRadius: 14, background: "hsl(var(--muted) / 0.5)", animation: "an-pulse 1.5s ease-in-out infinite" }} />;
}

// ─── Row 1a: ELO Histogram ─────────────────────────────────────────────────────
function EloHistogram({ data, lang }: { data: AnalyticsData["eloHistogram"]; lang: Lang }) {
  const avgX = data.length ? data.reduce((s, d) => s + d.x * d.count, 0) / data.reduce((s, d) => s + d.count, 0) : 0;
  return (
    <GlassCard style={{ height: 240 }}>
      <CH title={t(lang, "an_elo_hist")} sub={t(lang, "an_elo_hist_sub")} />
      <div style={{ flex: 1, padding: "8px 4px 8px 8px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.3)" />
            <XAxis dataKey="bucket" tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} interval={3} />
            <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} width={28} />
            <Tooltip content={<CT />} />
            <ReferenceLine x={String(Math.round(avgX / 50) * 50)} stroke="hsl(var(--primary))" strokeDasharray="4 2" label={{ value: "avg", fontSize: 9, fill: "hsl(var(--primary))" }} />
            <Bar dataKey="count" name={t(lang, "an_players")} fill="hsl(var(--primary))" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

// ─── Row 1b: Winrate Distribution ─────────────────────────────────────────────
function WinrateDistribution({ data, lang }: { data: AnalyticsData["winrateDistribution"]; lang: Lang }) {
  return (
    <GlassCard style={{ height: 240 }}>
      <CH title={t(lang, "an_wr_dist")} sub={t(lang, "an_wr_dist_sub")} />
      <div style={{ flex: 1, padding: "8px 4px 8px 8px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.3)" />
            <XAxis dataKey="bucket" tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} interval={3} />
            <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} width={28} />
            <Tooltip content={<CT />} />
            <ReferenceLine x="50%" stroke="hsl(var(--primary))" strokeDasharray="4 2" label={{ value: "50%", fontSize: 9, fill: "hsl(var(--primary))", position: "insideTopLeft" }} />
            <Bar dataKey="count" name={t(lang, "an_players")} radius={[3,3,0,0]}>
              {data.map((entry, i) => <Cell key={i} fill={entry.from >= 50 ? "hsl(142,65%,50%)" : "hsl(0,65%,55%)"} fillOpacity={0.85} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

// ─── Row 2a: Games over time ───────────────────────────────────────────────────
function GamesOverTime({ data, lang }: { data: AnalyticsData["gamesOverTime"]; lang: Lang }) {
  return (
    <GlassCard style={{ height: 220 }}>
      <CH title={t(lang, "an_games_time")} sub={t(lang, "an_games_time_sub")} />
      <div style={{ flex: 1, padding: "8px 4px 8px 8px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="gGames" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.3)" />
            <XAxis dataKey="period" tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} width={32} />
            <Tooltip content={<CT />} />
            <Area type="monotone" dataKey="games" name={t(lang, "an_games")} stroke="hsl(var(--primary))" fill="url(#gGames)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

// ─── Row 2b: Median ELO trend ──────────────────────────────────────────────────
function MedianEloTrend({ data, lang }: { data: AnalyticsData["medianEloTrend"]; lang: Lang }) {
  return (
    <GlassCard style={{ height: 220 }}>
      <CH title={t(lang, "an_median_time")} sub={t(lang, "an_median_time_sub")} />
      <div style={{ flex: 1, padding: "8px 4px 8px 8px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="gMed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(210,70%,55%)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="hsl(210,70%,55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.3)" />
            <XAxis dataKey="period" tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} width={36} domain={["auto","auto"]} />
            <Tooltip content={<CT />} />
            <Area type="monotone" dataKey="medianElo" name={t(lang, "an_median_time")} stroke="hsl(210,70%,55%)" fill="url(#gMed)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

// ─── Row 3: ELO vs games (full width, tall) ────────────────────────────────────
function EloVsGamesScatter({ data, lang }: { data: AnalyticsData["eloVsGames"]; lang: Lang }) {
  return (
    <GlassCard style={{ height: 300 }}>
      <CH title={t(lang, "an_elo_vs_games")} sub={t(lang, "an_elo_vs_games_sub")} />
      <div style={{ flex: 1, padding: "8px 4px 8px 8px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 4, right: 16, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.3)" />
            <XAxis dataKey="games" name={t(lang, "an_games")} tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} type="number" domain={[0, "auto"]} padding={{ left: 20, right: 8 }} label={{ value: t(lang, "an_games_count"), position: "insideBottomRight", offset: -4, fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis dataKey="elo" name="ELO" tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} width={36} domain={["auto","auto"]} label={{ value: "ELO", angle: -90, position: "insideLeft", fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0]?.payload;
              return (
                <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                  <div style={{ fontWeight: 700, marginBottom: 3 }}>{d?.name}</div>
                  <div style={{ color: "hsl(var(--primary))" }}>ELO: {d?.elo?.toLocaleString("cs-CZ")}</div>
                  <div style={{ color: "hsl(var(--muted-foreground))" }}>{t(lang, "an_games_label")} {d?.games}</div>
                </div>
              );
            }} />
            <Scatter data={data} fill="hsl(var(--primary))" fillOpacity={0.65} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

// ─── Row 4: Top N ELO history (full width, tall, toggle TOP5/TOP10/TOP15) ──────
const TOPN_COLORS = ["hsl(152,65%,50%)","hsl(210,70%,55%)","hsl(42,80%,55%)","hsl(265,65%,60%)","hsl(0,65%,55%)","hsl(185,60%,50%)","hsl(320,60%,55%)","hsl(45,85%,55%)","hsl(280,60%,58%)","hsl(180,60%,50%)","hsl(60,70%,50%)","hsl(30,80%,55%)","hsl(200,65%,55%)","hsl(340,60%,55%)","hsl(90,60%,50%)"];

function TopNHistory({ data5, data10, data15, top10, lang }: { data5: AnalyticsData["top5History"]; data10: AnalyticsData["top10History"]; data15: AnalyticsData["top15History"]; top10: AnalyticsData["top10"]; lang: Lang }) {
  const [n, setN] = useState<5 | 10>(5);
  const names = n === 5 ? top10.slice(0, 5).map(p => p.name) : top10.slice(0, 10).map(p => p.name);
  // fall back to data5 if higher datasets are empty (data not yet loaded)
  const rawData = n === 5 ? data5 : (data10?.length ? data10 : data5);
  const chartData = rawData;
  const mt = "hsl(var(--muted-foreground))";

  return (
    <GlassCard style={{ height: "auto" }}>
      <div style={{ padding: "14px 18px 0", flexShrink: 0, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "hsl(var(--foreground))" }}>{t(lang, "an_top_history")}</div>
          <div style={{ fontSize: 11, color: mt, marginTop: 2, fontFamily: "var(--font-mono)" }}>{t(lang, "an_top_history_sub")}</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {([5, 10] as const).map(v => (
            <button key={v} onClick={() => setN(v)} style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "3px 10px", borderRadius: 6, border: "1px solid", cursor: "pointer", borderColor: n === v ? "hsl(var(--primary))" : "hsl(var(--border)/0.5)", background: n === v ? "hsl(var(--primary)/0.15)" : "transparent", color: n === v ? "hsl(var(--primary))" : mt, fontWeight: n === v ? 700 : 400 }}>
              TOP{v}
            </button>
          ))}
        </div>
      </div>
      <div style={{ height: 280, padding: "8px 4px 8px 8px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart key={`topn-${n}`} data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.3)" />
            <XAxis dataKey="label" tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} width={36} domain={["auto","auto"]} />
            <Tooltip content={<CT />} />
            {n <= 10 && <Legend wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-mono)" }} />}
            {names.map((name, i) => (
              <Line key={`${n}-${name}`} type="monotone" dataKey={name} stroke={TOPN_COLORS[i % TOPN_COLORS.length]} strokeWidth={n <= 10 ? 2 : 1.5} dot={false} connectNulls strokeOpacity={1} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

// ─── Row 5a: Activity heatmap ─────────────────────────────────────────────────
function ActivityHeatmap({ data, lang }: { data: AnalyticsData["activityHeatmap"]; lang: Lang }) {
  const parsed = data.map(d => ({ ...d, year: parseInt(d.period.split("-")[0]), month: parseInt(d.period.split("-")[1]) }));
  const max = Math.max(...parsed.map(d => d.count), 1);
  const years = [...new Set(parsed.map(d => d.year))].sort((a,b) => a - b);
  const months = [1,2,3,4,5,6,7,8,9,10,11,12];
  const monthNames = [t(lang,"month_jan"),t(lang,"month_feb"),t(lang,"month_mar"),t(lang,"month_apr"),t(lang,"month_may"),t(lang,"month_jun"),t(lang,"month_jul"),t(lang,"month_aug"),t(lang,"month_sep"),t(lang,"month_oct"),t(lang,"month_nov"),t(lang,"month_dec")];

  return (
    <GlassCard style={{ height: "auto" }}>
      <CH title={t(lang, "an_heatmap")} sub={t(lang, "an_heatmap_sub")} />
      <div style={{ padding: "10px 12px 12px" }}>
        <div style={{ display: "grid", gridTemplateColumns: `38px repeat(12, 1fr)`, gap: 2, marginBottom: 2 }}>
          <div />
          {monthNames.map(m => <div key={m} style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", textAlign: "center" }}>{m}</div>)}
        </div>
        {years.map(year => (
          <div key={year} style={{ display: "grid", gridTemplateColumns: `38px repeat(12, 1fr)`, gap: 2, marginBottom: 2 }}>
            <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", lineHeight: "16px" }}>{year}</div>
            {months.map(month => {
              const cell = parsed.find(d => d.year === year && d.month === month);
              const intensity = cell ? cell.count / max : 0;
              return (
                <div key={month} title={cell ? `${cell.label}: ${cell.count} zápasů` : "—"} style={{ height: 16, borderRadius: 2, background: intensity > 0 ? `hsl(152 65% 50% / ${0.15 + intensity * 0.8})` : "hsl(var(--muted) / 0.25)", transition: "background 0.2s", cursor: cell ? "default" : undefined }} />
              );
            })}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ─── Row 5b: Tournament pie (uses col D — tournament_detail) ──────────────────
function TournamentPie({ data, lang }: { data: AnalyticsData["tournamentPie"]; lang: Lang }) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  const [hovered, setHovered] = useState<string | null>(null);
  const RADIAN = Math.PI / 180;

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    if (percent < 0.06) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="hsl(var(--background))" textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 700, pointerEvents: "none" }}>
        {name.length > 14 ? name.slice(0, 13) + "…" : name}
      </text>
    );
  };

  return (
    <GlassCard style={{ height: "auto" }}>
      <CH title={t(lang, "an_tournament_pie")} sub={t(lang, "an_tournament_pie_sub")} />
      <div style={{ height: 280, padding: "8px 8px 4px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="name" cx="50%" cy="50%"
              outerRadius={110} innerRadius={40} paddingAngle={1}
              labelLine={false} label={renderLabel}
              onMouseEnter={(_: any, i: number) => setHovered(data[i]?.name ?? null)}
              onMouseLeave={() => setHovered(null)}>
              {data.map((d, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} opacity={hovered && hovered !== d.name ? 0.55 : 1} />)}
            </Pie>
            <Tooltip content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0]?.payload;
              return (
                <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>{d.name}</div>
                  <div style={{ color: "hsl(var(--primary))" }}>{d.count} zápasů</div>
                  <div style={{ color: "hsl(var(--muted-foreground))" }}>{Math.round(d.count / total * 100)}% celku</div>
                </div>
              );
            }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Compact legend */}
      <div style={{ padding: "0 12px 12px", display: "flex", flexWrap: "wrap", gap: "3px 10px" }}>
        {data.map((d, i) => (
          <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
            <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))" }}>{d.name}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ─── WR vs Opp helpers ─────────────────────────────────────────────────────────
type WROppData = AnalyticsData["communityWinrateVsOpp"];
const green   = "hsl(142,65%,50%)";
const red     = "hsl(0,65%,55%)";
const amber   = "hsl(42,80%,55%)";
const blue    = "hsl(210,70%,60%)";
const primary = "hsl(var(--primary))";
const muted   = "hsl(var(--muted-foreground))";

const wrColor = (wr: number) => {
  if (wr >= 65) return green;
  if (wr >= 55) return "hsl(100,60%,45%)";
  if (wr >= 45) return amber;
  if (wr >= 35) return "hsl(20,65%,50%)";
  return red;
};

const WRFooter = ({ totalGames, bucketCount, avgActualWR, avgThWR, lang }: { totalGames: number; bucketCount: number; avgActualWR: number; avgThWR: number; lang: Lang }) => (
  <div style={{ display: "flex", gap: 16, padding: "8px 16px 12px", borderTop: "1px solid hsl(var(--border)/0.3)", flexWrap: "wrap" }}>
    <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: muted }}>
      <span style={{ color: "hsl(var(--foreground))", fontWeight: 600 }}>{totalGames.toLocaleString("cs-CZ")}</span> {t(lang, "an_matches_dot")}{" "}
      <span style={{ color: "hsl(var(--foreground))", fontWeight: 600 }}>{bucketCount}</span> {t(lang, "an_buckets_n")}
    </div>
    <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: muted }}>
      {t(lang, "an_avg_wr")} <span style={{ color: wrColor(avgActualWR), fontWeight: 600 }}>{avgActualWR}%</span>
      {" "}{t(lang, "an_vs_theor")} <span style={{ color: blue, fontWeight: 600 }}>{avgThWR}%</span>
      {" · "}{t(lang, "an_deviation")}<span style={{ color: avgActualWR - avgThWR >= 0 ? green : red, fontWeight: 600 }}>{avgActualWR - avgThWR >= 0 ? "+" : ""}{Math.round((avgActualWR - avgThWR) * 10) / 10}%</span>
    </div>
    <div style={{ fontSize: 10, color: muted, fontFamily: "var(--font-mono)" }}>{t(lang, "an_theor_note")}</div>
  </div>
);

// ─── Row 6: Buckety ELO ───────────────────────────────────────────────────────
function WRBucketyElo({ data, lang }: { data: WROppData; lang: Lang }) {
  const [minGames, setMinGames] = useState<10 | 20>(10);
  const chartData = data.byOppElo.filter(d => d.games >= minGames);
  const totalGames = chartData.reduce((s, d) => s + d.games, 0);
  const avgActualWR = chartData.length > 0 ? Math.round(chartData.reduce((s, d) => s + d.winrate * d.games, 0) / Math.max(totalGames, 1) * 10) / 10 : 0;
  const avgThWR = chartData.length > 0 ? Math.round(chartData.reduce((s, d) => s + d.theorWR * d.games, 0) / Math.max(totalGames, 1) * 10) / 10 : 0;

  const TT = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, padding: "9px 13px", fontFamily: "var(--font-mono)", fontSize: 11, minWidth: 190 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>ELO soupeře: {d.label}</div>
        <div style={{ color: wrColor(d.winrate), fontWeight: 700, fontSize: 13 }}>Winrate: {d.winrate}%</div>
        <div style={{ color: muted, marginTop: 2 }}>Zápasy: {d.games?.toLocaleString("cs-CZ")}</div>
        <div style={{ color: muted }}>Výhry: {d.wins} · Remízy: {d.draws} · Prohry: {d.losses}</div>
        <div style={{ color: blue, marginTop: 4 }}>Teoret. (ELO): {d.theorWR}%</div>
        <div style={{ color: d.winrate - d.theorWR >= 0 ? green : red }}>Odchylka: {d.winrate - d.theorWR >= 0 ? "+" : ""}{Math.round((d.winrate - d.theorWR) * 10) / 10}%</div>
      </div>
    );
  };

  return (
    <GlassCard style={{ height: "auto" }}>
      <div style={{ padding: "14px 16px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>{t(lang, "an_wr_bucket")}</div>
          <div style={{ fontSize: 11, color: muted, marginTop: 2, fontFamily: "var(--font-mono)" }}>{t(lang, "an_wr_bucket_sub")}</div>
        </div>
        <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: muted, fontFamily: "var(--font-mono)", marginRight: 4 }}>{t(lang, "an_min_matches")}</span>
          {(([10, 20] as const)).map(v => (
            <button key={v} onClick={() => setMinGames(v)} style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "3px 9px", borderRadius: 6, border: "1px solid", cursor: "pointer", borderColor: minGames === v ? primary : "hsl(var(--border)/0.5)", background: minGames === v ? "hsl(var(--primary)/0.15)" : "transparent", color: minGames === v ? primary : muted, fontWeight: minGames === v ? 700 : 400 }}>{v}</button>
          ))}
        </div>
      </div>
      <div style={{ height: 280, padding: "8px 8px 8px 4px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.3)" />
            <XAxis dataKey="bucket" tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} interval={Math.max(0, Math.floor(chartData.length / 12))} label={{ value: t(lang, "an_opp_elo"), position: "insideBottomRight", offset: -4, fontSize: 9, fill: muted }} />
            <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} width={30} domain={[0, 100]} />
            <ReferenceLine y={50} stroke={muted} strokeDasharray="4 2" label={{ value: "50%", fontSize: 9, fill: muted, position: "insideTopLeft" }} />
            <ReferenceLine x={data.avgCommunityElo} stroke={amber} strokeDasharray="3 2" label={{ value: `Avg ${data.avgCommunityElo}`, fontSize: 9, fill: amber, position: "insideTopRight" }} />
            <Tooltip content={<TT />} />
            <Bar dataKey="winrate" name={t(lang, "an_actual_wr")} radius={[3,3,0,0]}>
              {chartData.map((d, i) => <Cell key={i} fill={wrColor(d.winrate)} fillOpacity={0.82} />)}
            </Bar>
            <Line type="monotone" dataKey="theorWR" name={t(lang, "an_theor_elo")} stroke={blue} strokeWidth={2} strokeDasharray="5 3" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <WRFooter totalGames={totalGames} bucketCount={chartData.length} avgActualWR={avgActualWR} avgThWR={avgThWR} lang={lang} />
    </GlassCard>
  );
}

// ─── Row 7: ELO Rozdíl ────────────────────────────────────────────────────────
function WREloRozdil({ data, lang }: { data: WROppData; lang: Lang }) {
  const [minGames, setMinGames] = useState<10 | 20>(10);
  const chartData = data.byEloDiff.filter(d => d.games >= minGames);
  const totalGames = chartData.reduce((s, d) => s + d.games, 0);
  const avgActualWR = chartData.length > 0 ? Math.round(chartData.reduce((s, d) => s + d.winrate * d.games, 0) / Math.max(totalGames, 1) * 10) / 10 : 0;
  const avgThWR = chartData.length > 0 ? Math.round(chartData.reduce((s, d) => s + d.theorWR * d.games, 0) / Math.max(totalGames, 1) * 10) / 10 : 0;

  const TT = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, padding: "9px 13px", fontFamily: "var(--font-mono)", fontSize: 11, minWidth: 190 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>ELO rozdíl: {d.label}</div>
        <div style={{ fontSize: 10, color: muted, marginBottom: 4 }}>{d.bucket >= 0 ? "Ty jsi favorit" : "Ty jsi outsider"}</div>
        <div style={{ color: wrColor(d.winrate), fontWeight: 700, fontSize: 13 }}>Winrate: {d.winrate}%</div>
        <div style={{ color: muted }}>Zápasy: {d.games?.toLocaleString("cs-CZ")}</div>
        <div style={{ color: blue, marginTop: 4 }}>Teoret. (ELO): {d.theorWR}%</div>
        <div style={{ color: d.winrate - d.theorWR >= 0 ? green : red }}>Odchylka: {d.winrate - d.theorWR >= 0 ? "+" : ""}{Math.round((d.winrate - d.theorWR) * 10) / 10}%</div>
      </div>
    );
  };

  return (
    <GlassCard style={{ height: "auto" }}>
      <div style={{ padding: "14px 16px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>{t(lang, "an_wr_diff")}</div>
          <div style={{ fontSize: 11, color: muted, marginTop: 2, fontFamily: "var(--font-mono)" }}>{t(lang, "an_wr_diff_sub")}</div>
        </div>
        <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: muted, fontFamily: "var(--font-mono)", marginRight: 4 }}>{t(lang, "an_min_matches")}</span>
          {(([10, 20] as const)).map(v => (
            <button key={v} onClick={() => setMinGames(v)} style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "3px 9px", borderRadius: 6, border: "1px solid", cursor: "pointer", borderColor: minGames === v ? primary : "hsl(var(--border)/0.5)", background: minGames === v ? "hsl(var(--primary)/0.15)" : "transparent", color: minGames === v ? primary : muted, fontWeight: minGames === v ? 700 : 400 }}>{v}</button>
          ))}
        </div>
      </div>
      <div style={{ height: 280, padding: "8px 8px 8px 4px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.3)" />
            <XAxis dataKey="bucket" tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} interval={Math.max(0, Math.floor(chartData.length / 14))} label={{ value: t(lang, "an_elo_diff_label"), position: "insideBottomRight", offset: -4, fontSize: 9, fill: muted }} />
            <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} width={30} domain={[0, 100]} />
            <ReferenceLine y={50} stroke={muted} strokeDasharray="4 2" />
            <ReferenceLine x={0} stroke={amber} strokeDasharray="3 2" label={{ value: t(lang, "an_equal"), fontSize: 9, fill: amber, position: "insideTopLeft" }} />
            <Tooltip content={<TT />} />
            <Line type="monotone" dataKey="winrate" name={t(lang, "an_actual_wr")} stroke={green} strokeWidth={2.5} dot={{ r: 3, fill: green, stroke: "none" }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="theorWR" name={t(lang, "an_theor_elo")} stroke={blue} strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <WRFooter totalGames={totalGames} bucketCount={chartData.length} avgActualWR={avgActualWR} avgThWR={avgThWR} lang={lang} />
    </GlassCard>
  );
}

// ─── Row 8: Bubble ────────────────────────────────────────────────────────────
function WRBubble({ data, lang }: { data: WROppData; lang: Lang }) {
  const [minGames, setMinGames] = useState<10 | 20>(10);
  const chartData = data.byOppElo.filter(d => d.games >= minGames);
  const maxGames = Math.max(...chartData.map(d => d.games), 1);
  const MAX_BUBBLE = 22;

  return (
    <GlassCard style={{ height: "auto" }}>
      <div style={{ padding: "14px 16px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>{t(lang, "an_wr_bubble")}</div>
          <div style={{ fontSize: 11, color: muted, marginTop: 2, fontFamily: "var(--font-mono)" }}>{t(lang, "an_wr_bubble_sub")}</div>
        </div>
        <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: muted, fontFamily: "var(--font-mono)", marginRight: 4 }}>{t(lang, "an_min_matches")}</span>
          {(([10, 20] as const)).map(v => (
            <button key={v} onClick={() => setMinGames(v)} style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "3px 9px", borderRadius: 6, border: "1px solid", cursor: "pointer", borderColor: minGames === v ? primary : "hsl(var(--border)/0.5)", background: minGames === v ? "hsl(var(--primary)/0.15)" : "transparent", color: minGames === v ? primary : muted, fontWeight: minGames === v ? 700 : 400 }}>{v}</button>
          ))}
        </div>
      </div>
      <div style={{ height: 300, padding: "8px 8px 8px 4px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 16, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.3)" />
            <XAxis dataKey="bucket" tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} interval={Math.max(0, Math.floor(chartData.length / 12))} label={{ value: t(lang, "an_opp_elo"), position: "insideBottomRight", offset: -4, fontSize: 9, fill: muted }} />
            <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} width={30} domain={[0, 100]} />
            <ReferenceLine y={50} stroke={muted} strokeDasharray="4 2" label={{ value: "50%", fontSize: 9, fill: muted, position: "insideTopLeft" }} />
            <ReferenceLine x={data.avgCommunityElo} stroke={amber} strokeDasharray="3 2" label={{ value: `Avg ${data.avgCommunityElo}`, fontSize: 9, fill: amber, position: "insideTopRight" }} />
            <Line type="monotone" dataKey="theorWR" name={t(lang, "an_theor_elo")} stroke={blue} strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
            <Line type="monotone" dataKey="winrate" name={t(lang, "an_actual_wr")} stroke={green} strokeWidth={1.8} dot={false} strokeOpacity={0.5} />
            <Scatter
              dataKey="winrate"
              name={t(lang, "an_buckets")}
              shape={(props: any) => {
                const { cx, cy, payload } = props;
                const r = Math.max(5, Math.sqrt(payload.games / maxGames) * MAX_BUBBLE);
                const fill = wrColor(payload.winrate);
                return <circle cx={cx} cy={cy} r={r} fill={fill} fillOpacity={0.75} stroke={fill} strokeWidth={1.5} strokeOpacity={1} />;
              }}
            >
              {chartData.map((_, i) => <Cell key={i} />)}
            </Scatter>
            <Tooltip content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload.find((p: any) => p.dataKey === "winrate")?.payload;
              if (!d) return null;
              return (
                <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, padding: "9px 13px", fontFamily: "var(--font-mono)", fontSize: 11, minWidth: 190 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>ELO soupeře: {d.label}</div>
                  <div style={{ color: wrColor(d.winrate), fontWeight: 700, fontSize: 13 }}>Winrate: {d.winrate}%</div>
                  <div style={{ color: muted, marginTop: 2 }}>Zápasy: {d.games?.toLocaleString("cs-CZ")} <span style={{ opacity: 0.6 }}>(vel. bodu)</span></div>
                  <div style={{ color: muted }}>Výhry: {d.wins} · Remízy: {d.draws} · Prohry: {d.losses}</div>
                  <div style={{ color: blue, marginTop: 4 }}>Teoret. (ELO): {d.theorWR}%</div>
                  <div style={{ color: d.winrate - d.theorWR >= 0 ? green : red }}>Odchylka: {d.winrate - d.theorWR >= 0 ? "+" : ""}{Math.round((d.winrate - d.theorWR) * 10) / 10}%</div>
                </div>
              );
            }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function AnalyticsView({ prefetchCache }: { prefetchCache?: PrefetchCache }) {
  const { mode } = useRatingMode();
  const { region } = useRegion();
  const { lang } = useAppNav();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = prefetchCache?.[mode];
    if (cached?.analytics && prefetchCache?.region === region) { setData(cached.analytics); setLoading(false); return; }
    setLoading(true); setData(null);
    fetch(`/api/analytics-data?mode=${mode}&region=${region}`)
      .then(r => r.json()).then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [mode, region, prefetchCache]);

  return (
    <div style={{ height: "100%", overflowY: "auto", overflowX: "hidden", paddingRight: 4 }} className="scrollbar-thin">
      {/* Header — high contrast title */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid hsl(var(--border) / 0.4)" }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "hsl(var(--primary) / 0.18)", boxShadow: "0 0 16px -4px hsl(var(--primary)/0.4)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "hsl(var(--foreground))", lineHeight: 1 }}>Obecné grafy & Analytics</div>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", marginTop: 3 }}>Statistiky a trendy celé komunity · {mode} systém</div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "hsl(var(--primary))", background: "hsl(var(--primary) / 0.12)", border: "1px solid hsl(var(--primary) / 0.25)", padding: "4px 12px", borderRadius: 99 }}>{mode}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 24 }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[240, 240, 220, 220].map((h, i) => <Sk key={i} h={h} />)}
            </div>
            {[300, 320, 260, 260, 280, 280, 300].map((h, i) => <Sk key={i+4} h={h} />)}
          </div>
        ) : data ? (
          <>
            {/* Row 1: ELO Distribuce | Winrate distribuce */}
            <div className="mobile-stack" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <EloHistogram data={data.eloHistogram} lang={lang} />
              <WinrateDistribution data={data.winrateDistribution} lang={lang} />
            </div>

            {/* Row 2: Zápasy v čase | Medián ELO v čase */}
            <div className="mobile-stack" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <GamesOverTime data={data.gamesOverTime} lang={lang} />
              <MedianEloTrend data={data.medianEloTrend ?? []} lang={lang} />
            </div>

            {/* Row 3: ELO vs počet her — full width, taller */}
            <EloVsGamesScatter data={data.eloVsGames} lang={lang} />

            {/* Row 4: Top N ELO vývoj — full width, taller */}
            <TopNHistory data5={data.top5History} data10={data.top10History ?? []} data15={data.top15History ?? []} top10={data.top10} lang={lang} />

            {/* Row 5: Aktivita heatmapa | Zápasy per turnaj */}
            <div className="mobile-stack" style={{ display: "grid", gridTemplateColumns: "5fr 7fr", gap: 12, alignItems: "start" }}>
              <ActivityHeatmap data={data.activityHeatmap} lang={lang} />
              <TournamentPie data={data.tournamentPie} lang={lang} />
            </div>

            {/* Row 6: Buckety ELO */}
            {data.communityWinrateVsOpp && <WRBucketyElo data={data.communityWinrateVsOpp} lang={lang} />}

            {/* Row 7: ELO Rozdíl */}
            {data.communityWinrateVsOpp && <WREloRozdil data={data.communityWinrateVsOpp} lang={lang} />}

            {/* Row 8: Bubble */}
            {data.communityWinrateVsOpp && <WRBubble data={data.communityWinrateVsOpp} lang={lang} />}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: 40, color: muted, fontFamily: "var(--font-mono)", fontSize: 13 }}>{t(lang, "error")}</div>
        )}
      </div>
      <style jsx global>{`@keyframes an-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}
