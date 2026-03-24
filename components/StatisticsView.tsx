"use client";

import { useEffect, useState, useRef } from "react";
import { useRatingMode } from "./RatingModeProvider";
import { GeneralStats } from "@/lib/dataFetchers";
import type { PrefetchCache } from "@/app/page";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Swords, Star, UserCheck, Activity, Target, Hash, Shield, Trophy } from "lucide-react";

// ─── Glass card ───────────────────────────────────────────────────────────────
function GC({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", ...style }}>
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        background: "hsl(var(--card) / 0.88)",
        backdropFilter: "blur(16px) saturate(150%)",
        WebkitBackdropFilter: "blur(16px) saturate(150%)",
        border: "1px solid hsl(var(--card-border) / 0.85)",
        borderRadius: 14,
      }} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>{children}</div>
    </div>
  );
}

function SH({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "hsl(var(--muted-foreground))", paddingLeft: 2, paddingBottom: 2 }}>
      {children}
    </div>
  );
}

function Sk({ cols }: { cols?: number }) {
  return <div style={{ height: 80, borderRadius: 14, background: "hsl(var(--muted) / 0.5)", animation: "stat-pulse 1.5s ease-in-out infinite", ...(cols ? { gridColumn: `span ${cols}` } : {}) }} />;
}

function SB({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <GC>
      <div style={{ padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: color ? `${color}22` : "hsl(var(--muted))", color: color ?? "hsl(var(--muted-foreground))" }}>
          <Icon size={16} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "hsl(var(--muted-foreground))", marginBottom: 3 }}>{label}</div>
          <div style={{ fontSize: 20, fontWeight: 600, fontFamily: "var(--font-display)", lineHeight: 1, color: color ?? "hsl(var(--foreground))" }}>{value}</div>
          {sub && <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", marginTop: 3 }}>{sub}</div>}
        </div>
      </div>
    </GC>
  );
}

// ─── W/D/L bar ────────────────────────────────────────────────────────────────
function WDLBar({ wins, losses, draws }: { wins: number; losses: number; draws: number }) {
  const total = wins + losses + draws || 1;
  const fmt = (n: number) => n.toLocaleString("cs-CZ");
  return (
    <GC>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "hsl(var(--muted-foreground))", marginBottom: 10 }}>Výhry / Prohry / Remízy</div>
        <div style={{ display: "flex", gap: 20, marginBottom: 10 }}>
          {[["Výhry", wins, "hsl(142 65% 50%)"], ["Prohry", losses, "hsl(0 65% 55%)"], ["Remízy", draws, "hsl(var(--muted-foreground))"]] .map(([l, v, c]) => (
            <div key={l as string}>
              <div style={{ fontSize: 22, fontWeight: 600, color: c as string, fontFamily: "var(--font-mono)", lineHeight: 1 }}>{fmt(v as number)}</div>
              <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", marginTop: 2 }}>{l as string}</div>
            </div>
          ))}
        </div>
        <div style={{ height: 6, borderRadius: 99, overflow: "hidden", background: "hsl(var(--muted))", display: "flex" }}>
          <div style={{ width: `${wins / total * 100}%`, background: "hsl(142 65% 50%)" }} />
          <div style={{ width: `${draws / total * 100}%`, background: "hsl(var(--muted-foreground) / 0.4)" }} />
          <div style={{ width: `${losses / total * 100}%`, background: "hsl(0 65% 55%)" }} />
        </div>
      </div>
    </GC>
  );
}

// ─── VT colours ───────────────────────────────────────────────────────────────
const VT_COLORS: Record<string, string> = {
  "Class A": "hsl(142,70%,48%)",
  "Class B": "hsl(43,88%,50%)",
  "Class C": "hsl(24,82%,52%)",
  "Class D": "hsl(0,65%,55%)",
};
const VT_ORDER = ["Class A", "Class B", "Class C", "Class D"];

// ─── VT class bar chart ────────────────────────────────────────────────────────
function VtBarChart({ data }: { data: GeneralStats["vtDistribution"] }) {
  const CT = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, padding: "7px 12px", fontFamily: "var(--font-mono)", fontSize: 11 }}>
        <div style={{ fontWeight: 600 }}>{d.label}</div>
        <div style={{ color: VT_COLORS[d.label] }}>{d.count} hráčů</div>
      </div>
    );
  };
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barCategoryGap="28%">
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.3)" />
        <XAxis dataKey="label" tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "hsl(var(--foreground))", fontWeight: 600 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
        <Tooltip content={<CT />} cursor={{ fill: "hsl(var(--primary) / 0.06)" }} />
        <Bar dataKey="count" radius={[5, 5, 0, 0]} maxBarSize={52}>
          {data.map((d, i) => <Cell key={i} fill={VT_COLORS[d.label] ?? "hsl(var(--primary))"} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── VT ranked scatter — like the K-means chart in the image ─────────────────
function VtRankedScatter({ data }: { data: GeneralStats["vtScatter"] }) {
  const [tooltip, setTooltip] = useState<{ name: string; elo: number; vt: string; rank: number; x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "hsl(var(--muted-foreground))", fontSize: 12, fontFamily: "var(--font-mono)" }}>
        Žádná data výkonnostních tříd
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.elo - a.elo);
  const n = sorted.length;
  const elos = sorted.map(d => d.elo);
  const minElo = Math.min(...elos) - 100;
  const maxElo = Math.max(...elos) + 100;
  const eloRange = maxElo - minElo || 1;

  // SVG viewBox — extra left/right rank padding (5% of n) so edge dots have breathing room
  const PAD = { left: 36, right: 10, top: 10, bottom: 24 };
  const VW = 480, VH = 200;
  const plotW = VW - PAD.left - PAD.right;
  const plotH = VH - PAD.top - PAD.bottom;
  const rankPad = Math.max(1, n * 0.04); // ~4% padding each side

  const toX = (rank: number) => PAD.left + ((rank - 1 + rankPad) / (n - 1 + 2 * rankPad)) * plotW;
  const toY = (elo: number) => PAD.top + (1 - (elo - minElo) / eloRange) * plotH;

  // Y axis ticks every 100 ELO
  const yTickStep = 100;
  const yTickMin = Math.ceil(minElo / yTickStep) * yTickStep;
  const yTickMax = Math.floor(maxElo / yTickStep) * yTickStep;
  const yTicks: number[] = [];
  for (let t = yTickMin; t <= yTickMax; t += yTickStep) yTicks.push(t);

  // X axis ticks every ~10 players
  const xTickStep = Math.ceil(n / 10) * 2;
  const xTicks: number[] = [];
  for (let t = 1; t <= n; t += xTickStep) xTicks.push(t);
  if (xTicks[xTicks.length - 1] !== n) xTicks.push(n);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VW} ${VH}`}
        style={{ width: "100%", height: "100%" }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {yTicks.map(t => (
          <line key={t} x1={PAD.left} x2={VW - PAD.right} y1={toY(t)} y2={toY(t)}
            stroke="hsl(var(--border))" strokeWidth={0.5} strokeOpacity={0.5} />
        ))}

        {/* Y axis ticks + labels */}
        {yTicks.map(t => (
          <text key={t} x={PAD.left - 4} y={toY(t)} style={{ fontSize: 7, fontFamily: "var(--font-mono)" }}
            fill="hsl(var(--muted-foreground))" textAnchor="end" dominantBaseline="middle">
            {t}
          </text>
        ))}

        {/* X axis ticks + labels */}
        {xTicks.map(t => (
          <text key={t} x={toX(t)} y={VH - PAD.bottom + 9} style={{ fontSize: 7, fontFamily: "var(--font-mono)" }}
            fill="hsl(var(--muted-foreground))" textAnchor="middle">
            {t}
          </text>
        ))}

        {/* Dots */}
        {sorted.map((d, i) => {
          const cx = toX(i + 1);
          const cy = toY(d.elo);
          const col = VT_COLORS[d.vt] ?? "#888";
          const isH = tooltip?.name === d.name;
          return (
            <circle
              key={d.name + i}
              cx={cx} cy={cy}
              r={isH ? 4 : 2.5}
              fill={col}
              fillOpacity={isH ? 1 : 0.85}
              stroke={isH ? "hsl(var(--background))" : col}
              strokeWidth={isH ? 1.5 : 0.5}
              strokeOpacity={isH ? 1 : 0.5}
              style={{ cursor: "pointer", transition: "r 0.1s" }}
              onMouseEnter={e => {
                const svgEl = svgRef.current;
                if (!svgEl) return;
                const rect = svgEl.getBoundingClientRect();
                const scaleX = rect.width / VW;
                const scaleY = rect.height / VH;
                setTooltip({ name: d.name, elo: d.elo, vt: d.vt, rank: i + 1, x: cx * scaleX + rect.left, y: cy * scaleY + rect.top });
              }}
              onMouseLeave={() => setTooltip(null)}
            />
          );
        })}

        {/* Axes */}
        <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={VH - PAD.bottom} stroke="hsl(var(--border))" strokeWidth={0.8} />
        <line x1={PAD.left} x2={VW - PAD.right} y1={VH - PAD.bottom} y2={VH - PAD.bottom} stroke="hsl(var(--border))" strokeWidth={0.8} />
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: "fixed", left: tooltip.x > (typeof window !== "undefined" ? window.innerWidth * 0.65 : 900) ? tooltip.x - 170 : tooltip.x + 14, top: tooltip.y - 20, zIndex: 9999,
          background: "hsl(var(--card))", border: "1px solid hsl(var(--border))",
          borderRadius: 8, padding: "6px 11px", fontFamily: "var(--font-mono)", fontSize: 11,
          pointerEvents: "none", whiteSpace: "nowrap",
          boxShadow: "0 4px 16px hsl(var(--foreground)/0.14)",
        }}>
          <div style={{ fontWeight: 700, color: "hsl(var(--foreground))" }}>{tooltip.name}</div>
          <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
            <span style={{ color: VT_COLORS[tooltip.vt] ?? "#888", fontWeight: 600 }}>{tooltip.vt}</span>
            <span style={{ color: "hsl(var(--muted-foreground))" }}>#{tooltip.rank}</span>
            <span style={{ color: "hsl(var(--primary))", fontWeight: 600 }}>{tooltip.elo} ELO</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ position: "absolute", bottom: 0, right: 4, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
        {VT_ORDER.map(vt => (
          <div key={vt} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: VT_COLORS[vt], flexShrink: 0 }} />
            <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: VT_COLORS[vt], fontWeight: 600 }}>{vt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StatisticsView({ prefetchCache }: { prefetchCache?: PrefetchCache }) {
  const { mode } = useRatingMode();
  const [data, setData] = useState<GeneralStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = prefetchCache?.[mode];
    if (cached?.stats) { setData(cached.stats); setLoading(false); return; }
    setLoading(true); setData(null);
    fetch(`/api/general-stats?mode=${mode}`)
      .then(r => r.json()).then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [mode, prefetchCache]);

  const fmt = (n?: number | null) => n != null ? n.toLocaleString("cs-CZ") : "—";
  const green = "hsl(142, 65%, 45%)";
  const blue  = "hsl(210, 70%, 55%)";
  const amber = "hsl(42, 80%, 50%)";

  return (
    <div style={{ height: "100%", overflowY: "auto", overflowX: "hidden", paddingRight: 4, display: "flex", flexDirection: "column" }} className="scrollbar-thin">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid hsl(var(--border) / 0.4)" }}>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "hsl(var(--primary))", background: "hsl(var(--primary) / 0.12)", border: "1px solid hsl(var(--primary) / 0.25)", padding: "3px 10px", borderRadius: 99 }}>{mode}</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>Obecné statistiky</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 28, flex: 1, minHeight: 0 }}>

        {/* ── 1. ZÁPASOVÉ STATISTIKY ────────────────────────────────────────── */}
        <div>
          <SH>Zápasové statistiky</SH>
          <div className="mobile-stack" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
            {loading ? [1,2,3,4].map(i => <Sk key={i} />) : <>
              <WDLBar wins={data?.totalWins ?? 0} losses={data?.totalLosses ?? 0} draws={data?.totalDraws ?? 0} />
              <SB icon={Target} label="Globální winrate"  value={`${data?.globalWinrate?.toFixed(1) ?? "—"}%`} sub="Výhry / Celkem"       color={green} />
              <SB icon={Hash}   label="Průměr her / hráč" value={fmt(data?.avgGamesPerPlayer)}                 sub="Aktivita hráčů"       color={blue}  />
              <SB icon={Shield} label="Avg. rozdíl ELO"   value={fmt(data?.avgMatchmakingDiff)}                sub="Matchmaking fairness" color={amber} />
            </>}
          </div>
        </div>

        {/* ── 2. PŘEHLED ────────────────────────────────────────────────────── */}
        <div>
          <SH>Přehled</SH>
          <div className="mobile-stack" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginTop: 8 }}>
            {loading ? [1,2,3,4,5].map(i => <Sk key={i} />) : <>
              <SB icon={Swords}    label="Zápasy celkem"    value={fmt(data?.totalGames)}       sub="Unique Match ID"     color={green} />
              <SB icon={Trophy}    label="Hráči celkem"     value={fmt(data?.playerCount)}      sub="Registrovaných"      color={blue}  />
              <SB icon={UserCheck} label="Aktivní (30 dní)" value={fmt(data?.activePlayers30d)} sub="Posl. měsíc"         color={green} />
              <SB icon={Star}      label="Medián ELO"       value={fmt(data?.medianElo)}        sub="Střed komunity"      color={amber} />
              <SB icon={Activity}  label="Zápasy (30 dní)"  value={fmt(data?.matchesLast30d)}   sub="Nedávná aktivita"    color={blue}  />
            </>}
          </div>
        </div>

        {/* ── 3. ELO DISTRIBUCE ─────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <SH>ELO distribuce</SH>
          {/* Fixed height grid — both columns stretch to same bottom */}
          <div className="mobile-stack stats-elo-grid" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 8, marginTop: 8, height: 360, alignItems: "stretch" }}>

            {/* Left column — stacked */}
            {loading
              ? <div style={{ display: "flex", flexDirection: "column", gap: 8 }}><Sk /><Sk /></div>
              : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%" }}>
                  {/* Nejhranější turnaj */}
                  <GC>
                    <div style={{ padding: "13px 15px" }}>
                      <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "hsl(var(--muted-foreground))", marginBottom: 6 }}>Nejhranější turnaj</div>
                      <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)", color: "hsl(var(--foreground))", lineHeight: 1.35, marginBottom: 4, wordBreak: "break-word" as const }}>
                        {data?.mostPlayedTournament.name || "—"}
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                        <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-mono)", color: blue }}>{fmt(data?.mostPlayedTournament.matches)}</span>
                        <span style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>zápasů</span>
                      </div>
                    </div>
                  </GC>

                  {/* VT class bar chart — flex-grows to fill rest of left column */}
                  <GC style={{ flex: 1, minHeight: 0 }}>
                    <div style={{ padding: "12px 14px 0", flexShrink: 0 }}>
                      <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "hsl(var(--muted-foreground))" }}>Výkonnostní třídy — počet hráčů</div>
                    </div>
                    <div style={{ flex: 1, minHeight: 0, padding: "4px 10px 12px" }}>
                      <VtBarChart data={data?.vtDistribution ?? []} />
                    </div>
                  </GC>
                </div>
              )
            }

            {/* Right column — ranked scatter fills full height */}
            {loading
              ? <Sk />
              : (
                <GC style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <div style={{ padding: "12px 16px 0", flexShrink: 0 }}>
                    <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "hsl(var(--muted-foreground))" }}>Rozložení hráčů v třídách podle ELO</div>
                    <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", marginTop: 1, marginBottom: 4 }}>hráči seřazeni dle ELO — najeď na bod pro jméno</div>
                  </div>
                  <div style={{ flex: 1, minHeight: 0, padding: "4px 16px 16px 10px", position: "relative" }}>
                    <VtRankedScatter data={data?.vtScatter ?? []} />
                  </div>
                </GC>
              )
            }
          </div>
        </div>

      </div>
      <style jsx global>{`@keyframes stat-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}
