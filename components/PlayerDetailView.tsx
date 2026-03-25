"use client";

import { useEffect, useState } from "react";
import { useAppNav } from "./AppContext";
import { useRatingMode } from "./RatingModeProvider";
import { avatarInitials } from "@/lib/utils";
import { PlayerDetailData, RecordsData } from "@/lib/dataFetchers";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell,
} from "recharts";
import {
  TrendingUp, TrendingDown, Swords, Star, Award, Shield, Target,
  Zap, Activity, Calendar, Clock, Trophy, BarChart2, Users, Flame,
} from "lucide-react";

const VT_META = {
  VT1: { label: "Class A", color: "hsl(152,72%,45%)", bg: "hsl(152 72% 45% / .12)", border: "hsl(152 72% 45% / .3)" },
  VT2: { label: "Class B", color: "hsl(42,92%,52%)",  bg: "hsl(42 92% 52% / .12)",  border: "hsl(42 92% 52% / .3)"  },
  VT3: { label: "Class C", color: "hsl(24,88%,56%)",  bg: "hsl(24 88% 56% / .12)",  border: "hsl(24 88% 56% / .3)"  },
  VT4: { label: "Class D", color: "hsl(0,70%,58%)",   bg: "hsl(0 70% 58% / .12)",   border: "hsl(0 70% 58% / .3)"   },
} as const;

// ─── Glass card ───────────────────────────────────────────────────────────────
function GC({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div className={className} style={{ position: "relative", borderRadius: 14, overflow: "hidden", ...style }}>
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        background: "hsl(var(--card) / 0.88)",
        backdropFilter: "blur(18px) saturate(150%)",
        WebkitBackdropFilter: "blur(18px) saturate(150%)",
        border: "1px solid hsl(var(--card-border) / 0.85)",
        borderRadius: 14,
      }} />
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>{children}</div>
    </div>
  );
}

const CT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: 11 }}>
      {label !== undefined && <div style={{ color: "hsl(var(--muted-foreground))", marginBottom: 2 }}>{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color ?? "hsl(var(--primary))", fontWeight: 600 }}>
          {p.name !== undefined ? `${p.name}: ` : ""}{typeof p.value === "number" ? p.value.toLocaleString("cs-CZ") : p.value}
        </div>
      ))}
    </div>
  );
};

function SH({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "hsl(var(--muted-foreground))", marginBottom: 6 }}>{children}</div>;
}

function KV({ label, value, color, size = "md" }: { label: string; value: string; color?: string; size?: "sm" | "md" | "lg" }) {
  const fs = size === "lg" ? 26 : size === "md" ? 20 : 15;
  return (
    <div>
      <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", letterSpacing: "0.08em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: fs, fontWeight: 600, fontFamily: "var(--font-mono)", color: color ?? "hsl(var(--foreground))", lineHeight: 1 }}>{value}</div>
    </div>
  );
}

function IndexBar({ label, value, tip }: { label: string; value: number; tip?: string }) {
  const color = value >= 70 ? "hsl(142,65%,50%)" : value >= 40 ? "hsl(42,80%,55%)" : "hsl(0,65%,55%)";
  return (
    <div title={tip}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))" }}>{label}</div>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600, color }}>{value}</div>
      </div>
      <div style={{ height: 5, borderRadius: 99, background: "hsl(var(--muted))", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.min(value, 100)}%`, background: color, borderRadius: 99, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

function Skeleton({ h = 60 }: { h?: number }) {
  return <div style={{ height: h, borderRadius: 14, background: "hsl(var(--muted) / 0.5)", animation: "pd-pulse 1.5s ease-in-out infinite" }} />;
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ data, communityRecords }: { data: PlayerDetailData; communityRecords?: RecordsData | null }) {
  const { selectedPlayer } = useAppNav();
  const { mode } = useRatingMode();
  const { summary: s, computed: c, eloTrend, rollingMomentum, deltaDistribution, weekdayPerf } = data;

  const fmt = (n: number) => n?.toLocaleString?.("cs-CZ") ?? "—";
  const fmtS = (n: number, d = 1) => (n >= 0 ? "+" : "") + n.toFixed(d);
  const green = "hsl(142,65%,50%)";
  const red = "hsl(0,65%,55%)";
  const amber = "hsl(42,80%,55%)";

  const [period, setPeriod] = useState<"30D"|"90D"|"180D"|"1Y"|"ALL">("ALL");
  const [trendMode, setTrendMode] = useState<"matchid"|"date">("matchid");
  const cutoffDays: Record<string, number> = { "30D": 30, "90D": 90, "180D": 180, "1Y": 365, "ALL": 99999 };
  const cutoff = new Date(Date.now() - cutoffDays[period] * 86400_000);

  const parseCzDate = (s: string): Date | null => {
    const parts = s.split(".");
    if (parts.length === 3) return new Date(+parts[2], +parts[1]-1, +parts[0]);
    return null;
  };

  const filteredTrend = eloTrend
    .filter(p => {
      if (period === "ALL") return true;
      const d = parseCzDate(p.date);
      return d ? d >= cutoff : true;
    })
    .sort((a, b) => {
      const da = parseCzDate(a.date), db = parseCzDate(b.date);
      if (!da || !db) return 0;
      return da.getTime() - db.getTime();
    });

  const filteredTrendByDate = (data.eloTrendByDate ?? [])
    .filter(p => {
      if (period === "ALL") return true;
      const d = parseCzDate(p.date);
      return d ? d >= cutoff : true;
    })
    .sort((a, b) => {
      const da = parseCzDate(a.date), db = parseCzDate(b.date);
      if (!da || !db) return 0;
      return da.getTime() - db.getTime();
    });

  const activeTrend = trendMode === "matchid" ? filteredTrend : filteredTrendByDate;
  const trendElos = activeTrend.map((p: any) => p.elo).filter((v: any) => typeof v === "number");
  const trendMin = trendElos.length ? Math.min(...trendElos) - 100 : "auto";
  const trendMax = trendElos.length ? Math.max(...trendElos) + 100 : "auto";

  const streakColor = c.currentStreak.type === "win" ? green : c.currentStreak.type === "lose" ? red : "hsl(var(--muted-foreground))";
  const streakLabel = c.currentStreak.type === "win" ? "🔥 Win streak" : c.currentStreak.type === "lose" ? "💀 Lose streak" : "—";
  const eloChange = c.eloChange30d;

  const total = s.wins + s.losses + s.draws || 1;
  const wPct = Math.round(s.wins / total * 100);
  const lPct = Math.round(s.losses / total * 100);
  const dPct = Math.round(s.draws / total * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, height: "100%", overflowY: "auto" }} className="scrollbar-thin">

      {/* ── HERO ROW: 3 panels ── */}
      <div className="mobile-stack" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, flexShrink: 0 }}>

        {/* Panel 1 — Name + ELO */}
        <GC>
          <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10, height: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))", border: "2px solid hsl(var(--primary) / 0.3)", boxShadow: "0 0 22px -4px hsl(var(--primary) / 0.28)", fontFamily: "var(--font-display)", flexShrink: 0 }}>
                {avatarInitials(s.name)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 16, fontFamily: "var(--font-display)", letterSpacing: "-0.03em", lineHeight: 1.15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 9, padding: "1px 7px", borderRadius: 99, background: "hsl(var(--primary) / 0.12)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.28)", fontFamily: "var(--font-mono)", fontWeight: 700, letterSpacing: "0.06em" }}>{mode}</span>
                  {(() => {
                    const vtc = (selectedPlayer as any)?.vtClass as keyof typeof VT_META | undefined;
                    const m = vtc ? VT_META[vtc] : null;
                    return m ? <span style={{ fontSize: 9, padding: "1px 7px", borderRadius: 99, background: m.bg, color: m.color, border: `1px solid ${m.border}`, fontFamily: "var(--font-mono)", fontWeight: 700 }}>{m.label}</span> : null;
                  })()}
                  <span style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>#{selectedPlayer?.id} · {s.lastMatch}</span>
                </div>
              </div>
            </div>
            <div style={{ borderTop: "1px solid hsl(var(--border)/0.4)", paddingTop: 10 }}>
              <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>{mode} Rating</div>
              <div style={{ fontSize: 40, fontWeight: 900, fontFamily: "var(--font-mono)", color: "hsl(var(--primary))", lineHeight: 1, letterSpacing: "-0.03em" }}>{fmt(s.currentElo)}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600, color: eloChange >= 0 ? green : red }}>{eloChange >= 0 ? "+" : ""}{fmt(eloChange)} <span style={{ fontSize: 9, color: "hsl(var(--muted-foreground))" }}>30d</span></span>
                <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))" }}>Peak: <span style={{ color: amber, fontWeight: 700 }}>{fmt(s.peakElo)}</span></span>
              </div>
            </div>
          </div>
        </GC>

        {/* Panel 2 — W/L/D */}
        <GC>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8, height: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", letterSpacing: "0.1em", textTransform: "uppercase" }}>Win / Loss / Draw</div>
              <span style={{ fontSize: 8, padding: "1px 7px", borderRadius: 99, background: "hsl(var(--primary)/0.12)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary)/0.28)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>{mode}</span>
            </div>
            {/* W/L/D bar first */}
            <div style={{ display: "flex", height: 6, borderRadius: 99, overflow: "hidden", gap: 1, flexShrink: 0 }}>
              <div style={{ flex: wPct || 0.5, background: green, borderRadius: "99px 0 0 99px", transition: "flex 0.5s ease" }} />
              <div style={{ flex: lPct || 0.5, background: red, transition: "flex 0.5s ease" }} />
              <div style={{ flex: dPct || 0.5, background: amber, borderRadius: "0 99px 99px 0", transition: "flex 0.5s ease" }} />
            </div>
            <div style={{ display: "flex", gap: 5, flex: 1 }}>
              {[
                { label: "Výhry", short: "W", value: s.wins, color: green, pct: wPct },
                { label: "Prohry", short: "L", value: s.losses, color: red, pct: lPct },
                { label: "Remízy", short: "D", value: s.draws, color: amber, pct: dPct },
              ].map(r => (
                <div key={r.short} style={{ flex: 1, padding: "8px 6px", borderRadius: 10, background: `${r.color}12`, border: `1px solid ${r.color}30`, textAlign: "center", display: "flex", flexDirection: "column", gap: 1 }}>
                  <div style={{ fontSize: 26, fontWeight: 900, fontFamily: "var(--font-mono)", color: r.color, lineHeight: 1, letterSpacing: "-0.03em" }}>{r.value}</div>
                  <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginTop: 2 }}>{r.label}</div>
                  <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600, color: r.color, opacity: 0.75 }}>{r.pct}%</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))" }}>{s.totalGames} her</span>
              <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 700, color: s.winrate >= 0.5 ? green : red }}>WR {(s.winrate * 100).toFixed(1)}%</span>
            </div>
          </div>
        </GC>

        {/* Panel 3 — Community records */}
        <GC>
          <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8, height: "100%" }}>
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", letterSpacing: "0.1em", textTransform: "uppercase" }}>Rekordy komunity</div>
            {(() => {
              const playerRecs = communityRecords?.categories.flatMap(cat =>
                cat.records
                  .filter(r => r.entry?.player === s.name)
                  .map(r => ({ icon: cat.icon, label: r.label, value: r.entry!.value, isAllTime: r.entry!.isAllTime }))
              ) ?? [];
              if (playerRecs.length > 0) {
                return (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, flex: 1, alignContent: "flex-start" }}>
                    {playerRecs.slice(0, 10).map((r, i) => (
                      <span key={`cr-${i}`} title={`${r.label}: ${r.value}`} style={{
                        fontSize: 9, padding: "3px 9px", borderRadius: 99,
                        background: `${amber}14`, border: `1px solid ${amber}30`, color: amber,
                        fontFamily: "var(--font-mono)", fontWeight: 700,
                        display: "inline-flex", alignItems: "center", gap: 4,
                        maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {r.icon}{r.isAllTime ? " 👑" : ""} {r.label.length > 22 ? r.label.slice(0, 20) + "…" : r.label}
                      </span>
                    ))}
                  </div>
                );
              }
              return (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, flex: 1, alignContent: "start" }}>
                  <div style={{ padding: "7px 10px", borderRadius: 9, background: "hsl(var(--muted)/0.35)", border: "1px solid hsl(var(--border)/0.4)" }}>
                    <div style={{ fontSize: 8, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>Perf. Rating</div>
                    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-mono)", color: "hsl(var(--primary))" }}>{fmt(c.performanceRating)}</div>
                  </div>
                  <div style={{ padding: "7px 10px", borderRadius: 9, background: "hsl(var(--muted)/0.35)", border: "1px solid hsl(var(--border)/0.4)" }}>
                    <div style={{ fontSize: 8, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>Bayesian WR</div>
                    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-mono)", color: "hsl(var(--primary))" }}>{s.bayesianWR ?? "—"}</div>
                  </div>
                </div>
              );
            })()}
          </div>
        </GC>
      </div>

      {/* ── ELO CHART ── */}
      <GC style={{ flexShrink: 0 }}>
        <div style={{ padding: "14px 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-display)" }}>Vývoj {mode} v čase</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", background: "hsl(var(--muted)/0.5)", borderRadius: 8, padding: 2, gap: 2 }}>
              {([["matchid", "Match ID"], ["date", "Datum"]] as const).map(([v, label]) => (
                <button key={v} onClick={() => setTrendMode(v)}
                  style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "3px 10px", borderRadius: 6, border: "none", cursor: "pointer", transition: "all 0.15s",
                    background: trendMode === v ? "hsl(var(--card))" : "transparent",
                    color: trendMode === v ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                    fontWeight: trendMode === v ? 600 : 400,
                    boxShadow: trendMode === v ? "0 1px 4px hsl(var(--background)/0.4)" : "none",
                  }}>{label}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {(["30D","90D","180D","1Y","ALL"] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)} style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "3px 8px", borderRadius: 6, border: "1px solid", borderColor: period === p ? "hsl(var(--primary))" : "hsl(var(--border)/0.5)", background: period === p ? "hsl(var(--primary)/0.15)" : "transparent", color: period === p ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))", cursor: "pointer" }}>{p}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ height: 220, padding: "8px 4px 8px 8px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeTrend} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="pdElo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.38} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.3)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} interval={Math.max(0, Math.ceil(activeTrend.length / 6) - 1)} />
              <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} width={42} domain={[trendMin, trendMax]} />
              <ReferenceLine y={s.peakElo} stroke={amber} strokeDasharray="4 2" label={{ value: "Peak", fontSize: 9, fill: amber, position: "insideTopRight" }} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return (
                  <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                    <div style={{ color: "hsl(var(--muted-foreground))", marginBottom: 2 }}>{d.date}</div>
                    <div style={{ color: "hsl(var(--primary))", fontWeight: 600 }}>ELO: {d.elo?.toLocaleString("cs-CZ")}</div>
                    {trendMode === "matchid" && d.delta !== undefined && (
                      <div style={{ color: d.delta >= 0 ? green : red }}>Δ {d.delta >= 0 ? "+" : ""}{d.delta}</div>
                    )}
                    {trendMode === "matchid" && d.result && (
                      <div style={{ color: "hsl(var(--foreground))", marginTop: 2 }}>{d.result} vs {d.opponent}</div>
                    )}
                  </div>
                );
              }} />
              <Area type="monotone" dataKey="elo" name="ELO" stroke="hsl(var(--primary))" fill="url(#pdElo)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GC>

      {/* ── STATS ROW 1: ELO overview + Activity + Streak ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 10, flexShrink: 0 }}>
        {/* ELO overview */}
        <GC>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            <SH>ELO přehled</SH>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <KV label="Peak ELO" value={fmt(s.peakElo)} color={amber} size="lg" />
              <KV label="Min ELO" value={fmt(s.minElo)} color={red} size="md" />
              <KV label="ELO Range" value={fmt(c.eloRange)} />
              <KV label="Dní od peak" value={s.daysSincePeak > 0 ? `${s.daysSincePeak}d` : "Aktuální peak"} color={s.daysSincePeak <= 7 ? green : "hsl(var(--foreground))"} />
              <KV label="Peak Retention" value={`${c.peakRetention}%`} color={c.peakRetention >= 90 ? green : amber} />
              <KV label="Bayesian WR" value={s.bayesianWR ?? "—"} color="hsl(var(--primary))" />
            </div>
            <div style={{ marginTop: 2 }}>
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", marginBottom: 4 }}>Peak retention</div>
              <div style={{ height: 5, borderRadius: 99, background: "hsl(var(--muted))" }}>
                <div style={{ height: "100%", width: `${c.peakRetention}%`, background: c.peakRetention >= 90 ? green : amber, borderRadius: 99 }} />
              </div>
            </div>
          </div>
        </GC>

        {/* Activity */}
        <GC>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            <SH>Aktivita & ELO změny</SH>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <KV label="Hry celkem" value={fmt(s.totalGames)} />
              <KV label="Avg ELO soupeřů" value={fmt(s.avgOppElo)} />
              <KV label="Δ 7 dní" value={(c.eloChange7d >= 0 ? "+" : "") + fmt(c.eloChange7d)} color={c.eloChange7d >= 0 ? green : red} />
              <KV label="Δ 30 dní" value={(c.eloChange30d >= 0 ? "+" : "") + fmt(c.eloChange30d)} color={c.eloChange30d >= 0 ? green : red} />
              <KV label="Avg změna" value={fmtS(c.avgDelta)} color={c.avgDelta >= 0 ? green : red} />
              <KV label="EV / zápas" value={fmtS(c.ev)} color={c.ev >= 0 ? green : red} />
              <KV label="Max zisk" value={`+${fmt(c.biggestSingleGain)}`} color={green} size="sm" />
              <KV label="Max ztráta" value={fmt(c.biggestSingleLoss)} color={red} size="sm" />
              <KV label="Perf. Rating" value={fmt(c.performanceRating)} color="hsl(var(--primary))" size="sm" />
              <KV label="ELO Ceiling" value={`~${fmt(c.eloCeilingEstimate)}`} color={amber} size="sm" />
            </div>
          </div>
        </GC>

        {/* Soupeřský blok */}
        <GC>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            <SH>Soupeřský blok</SH>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {[
                { label: "WR vs. slabší (−100)", value: `${c.winVsWeaker}%`, color: c.winVsWeaker >= 60 ? green : amber },
                { label: "WR vs. podobní (±100)", value: `${c.winVsSimilar}%`, color: c.winVsSimilar >= 50 ? green : red },
                { label: "WR vs. silnější (+100)", value: `${c.winVsStronger}%`, color: c.winVsStronger >= 40 ? green : red },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 8px", borderRadius: 8, background: "hsl(var(--muted)/0.3)" }}>
                  <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{r.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-mono)", color: r.color }}>{r.value}</div>
                </div>
              ))}
            </div>
            <div style={{ paddingTop: 8, borderTop: "1px solid hsl(var(--border)/0.3)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <div>
                <div style={{ fontSize: 9, color: red, fontFamily: "var(--font-mono)", marginBottom: 1 }}>💀 Nemesis</div>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-display)" }}>{c.nemesis ?? "—"}</div>
                {c.nemesis && c.nemesis !== "—" && <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>WR: {c.nemesisWR}%</div>}
              </div>
              <div>
                <div style={{ fontSize: 9, color: green, fontFamily: "var(--font-mono)", marginBottom: 1 }}>🏆 Prey</div>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-display)" }}>{c.prey ?? "—"}</div>
                {c.prey && c.prey !== "—" && <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>WR: {c.preyWR}%</div>}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>Nejčastější soupeř</div>
              <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)" }}>{c.mostPlayedOpponent.name}</div>
              <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{c.mostPlayedOpponent.games} her · {c.mostPlayedOpponent.winrate}% WR</div>
            </div>
          </div>
        </GC>
      </div>

      {/* ── STATS ROW 2: Advanced indices + Streak block ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 10, flexShrink: 0 }}>
        {/* Pokročilé indexy */}
        <GC>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            <SH>Pokročilé indexy</SH>
            <IndexBar label="Stability Index" value={c.stabilityIndex} tip="100 = stabilní výkyvy ELO; 0 = extrémní výkyvy" />
            <IndexBar label="Momentum Index" value={c.momentumIndex} tip="% výher v posledních 20 hrách" />
            <IndexBar label="Consistency Score" value={c.consistencyScore} tip="Konzistence výkonu v blocích po 10 hrách" />
            <IndexBar label="Clutch Faktor" value={c.clutchFactor} tip="Winrate vs. silnější soupeři (ELO > tvoje)" />
            <IndexBar label="Tilt Index" value={c.tiltIndex} tip="Průměrný WR v 5 hrách po každé prohře" />
            <IndexBar label="Clutch pod tlakem" value={c.clutchUnderPressure} tip="Výhry jako outsider po 2 předchozích prohrách %" />
            <div style={{ marginTop: 4, paddingTop: 10, borderTop: "1px solid hsl(var(--border)/0.3)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <KV label="Gain/Loss ratio" value={c.gainLossRatio.toFixed(2)} color={c.gainLossRatio >= 1 ? green : red} size="sm" />
              <KV label="Upset Rate" value={`${c.upsetRate}%`} size="sm" />
              <KV label="Choking Index" value={`${c.chokingIndex}%`} color={c.chokingIndex >= 30 ? red : amber} size="sm" />
              <KV label="Hot Hand" value={fmtS(c.hotHandEffect, 2)} color={c.hotHandEffect > 0.15 ? green : "hsl(var(--foreground))"} size="sm" />
              <KV label="OQA Winrate" value={`${c.oqaWR}%`} color="hsl(var(--primary))" size="sm" />
              <KV label="True Skill ±" value={`±${c.trueSkillSigma}`} color="hsl(var(--muted-foreground))" size="sm" />
            </div>
          </div>
        </GC>

        {/* Streak blok */}
        <GC>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            <SH>Streak blok</SH>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <div style={{ padding: "8px 10px", borderRadius: 10, background: `${green}15`, border: `1px solid ${green}35`, textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>Nejdelší win</div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)", color: green }}>{s.longestWinStreak}×</div>
              </div>
              <div style={{ padding: "8px 10px", borderRadius: 10, background: `${red}15`, border: `1px solid ${red}35`, textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>Nejdelší lose</div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)", color: red }}>{s.longestLoseStreak}×</div>
              </div>
              <div style={{ padding: "8px 10px", borderRadius: 10, background: "hsl(var(--muted)/0.3)", border: "1px solid hsl(var(--border)/0.4)", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>Bez prohry</div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)", color: amber }}>{c.longestUnbeaten ?? 0}×</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
              <KV label="Tilt Recovery" value={`${c.tiltRecovery ?? 0}%`} color={(c.tiltRecovery ?? 0) >= 50 ? green : red} />
              <KV label="Comeback Rate" value={`${c.comebackRate ?? 0}%`} color={(c.comebackRate ?? 0) >= 50 ? green : amber} />
              <KV label="Největší comeback" value={`+${fmt(c.biggestComeback ?? 0)}`} color={green} />
              <KV label="Grind Efficiency" value={fmtS(c.grindEfficiency, 2)} color="hsl(var(--primary))" />
              <KV label="Nejlepší měsíc" value={c.bestMonth ?? "—"} size="sm" />
              <KV label="Zisk best měs." value={c.bestMonthGain > 0 ? `+${fmt(c.bestMonthGain)}` : "—"} color={green} size="sm" />
              <KV label="Nejhorší měsíc" value={c.worstMonth ?? "—"} size="sm" />
              <KV label="Ztráta worst měs." value={c.worstMonthLoss < 0 ? fmt(c.worstMonthLoss) : "—"} color={red} size="sm" />
            </div>
          </div>
        </GC>

        {/* ELO Brackets */}
        <GC>
          <div style={{ padding: "14px 16px 0", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)" }}>WR dle ELO pásma soupeře</div>
          <div style={{ padding: "10px 16px 16px" }}>
            {(c.eloBrackets ?? []).map((b, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "hsl(var(--foreground))", fontWeight: 500 }}>{b.bracket}</div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{b.games} her</span>
                    <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", color: b.games === 0 ? "hsl(var(--muted-foreground))" : b.winrate >= 55 ? green : b.winrate >= 45 ? amber : red }}>{b.games > 0 ? `${b.winrate}%` : "—"}</span>
                  </div>
                </div>
                <div style={{ height: 5, borderRadius: 99, background: "hsl(var(--muted))", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${b.games > 0 ? b.winrate : 0}%`, background: b.games === 0 ? "hsl(var(--muted))" : b.winrate >= 55 ? green : b.winrate >= 45 ? amber : red, borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
        </GC>
      </div>

      {/* ── CHARTS ROW ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10, flexShrink: 0, paddingBottom: 16 }}>
        {/* Delta distribuce */}
        <GC>
          <div style={{ padding: "14px 16px 0", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)" }}>Distribuce ELO změn</div>
          <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", padding: "0 16px 0" }}>Zelená = zisk, červená = ztráta</div>
          <div style={{ height: 160, padding: "8px 4px 8px 8px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deltaDistribution} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.3)" />
                <XAxis dataKey="bucket" tick={{ fontSize: 8, fontFamily: "var(--font-mono)" }} interval={1} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} width={24} />
                <ReferenceLine x="0" stroke="hsl(var(--border))" />
                <Tooltip content={<CT />} />
                <Bar dataKey="count" name="Her" radius={[3, 3, 0, 0]}>
                  {deltaDistribution.map((d, i) => <Cell key={i} fill={d.positive ? green : red} fillOpacity={0.8} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GC>

        {/* Weekday */}
        <GC>
          <div style={{ padding: "14px 16px 0", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)" }}>Výkon dle dne</div>
          <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", padding: "0 16px 4px" }}>Winrate per den v týdnu</div>
          <div style={{ height: 160, padding: "4px 4px 8px 8px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayPerf} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.3)" />
                <XAxis dataKey="shortDay" tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} width={24} domain={[0, 100]} />
                <ReferenceLine y={50} stroke="hsl(var(--border))" strokeDasharray="4 2" />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  return (
                    <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                      <div style={{ fontWeight: 600 }}>{d.day}</div>
                      <div style={{ color: "hsl(var(--primary))" }}>Winrate: {d.winrate}%</div>
                      <div style={{ color: "hsl(var(--muted-foreground))" }}>Hry: {d.games}</div>
                    </div>
                  );
                }} />
                <Bar dataKey="winrate" name="Winrate %" radius={[4, 4, 0, 0]}>
                  {weekdayPerf.map((d, i) => <Cell key={i} fill={d.winrate >= 55 ? green : d.winrate >= 45 ? amber : red} fillOpacity={0.85} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GC>

        {/* Rolling momentum */}
        <GC>
          <div style={{ padding: "14px 16px 0", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)" }}>Rolling Momentum</div>
          <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", padding: "0 16px 0" }}>Forma — výhry v posledních 20 hrách (%)</div>
          <div style={{ height: 160, padding: "8px 4px 8px 8px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rollingMomentum} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="pdMom" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={green} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.3)" />
                <XAxis dataKey="gameIndex" tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} width={28} domain={[0, 100]} />
                <ReferenceLine y={50} stroke="hsl(var(--border))" strokeDasharray="4 2" />
                <Tooltip content={<CT />} />
                <Area type="monotone" dataKey="momentum" name="Momentum %" stroke={green} fill="url(#pdMom)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GC>

        {/* Winrate vs opponent ELO */}
        <GC>
          <div style={{ padding: "14px 16px 0", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)" }}>Winrate vs. ELO soupeře</div>
          <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", padding: "0 16px 0" }}>% výher v závislosti na síle soupeře</div>
          <div style={{ height: 160, padding: "8px 4px 8px 8px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.winrateVsOpp} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.3)" />
                <XAxis dataKey="bucket" tick={{ fontSize: 8, fontFamily: "var(--font-mono)" }} interval={2} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} width={28} domain={[0, 100]} />
                <ReferenceLine y={50} stroke="hsl(var(--border))" strokeDasharray="4 2" />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  return (
                    <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                      <div style={{ color: "hsl(var(--muted-foreground))" }}>ELO soupeře: {d.bucket}</div>
                      <div style={{ color: "hsl(var(--primary))", fontWeight: 600 }}>Winrate: {d.wr}%</div>
                      <div style={{ color: "hsl(var(--muted-foreground))" }}>Zápasy: {d.games}</div>
                    </div>
                  );
                }} />
                <Bar dataKey="wr" name="Winrate %" radius={[3, 3, 0, 0]}>
                  {data.winrateVsOpp.map((d, i) => <Cell key={i} fill={d.wr >= 50 ? green : red} fillOpacity={0.8} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GC>
      </div>
    </div>
  );
}
function OpponentsTab({ data }: { data: PlayerDetailData }) {
  const { opponents, computed: c } = data;
  const green = "hsl(142,65%,50%)";
  const red = "hsl(0,65%,55%)";
  const amber = "hsl(42,80%,55%)";
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"games"|"winrate"|"avgDelta">("games");
  const filtered = search.trim()
    ? opponents.filter(o => o.name.toLowerCase().includes(search.toLowerCase()))
    : opponents;
  const sorted = [...filtered].sort((a, b) =>
    sortBy === "games" ? b.games - a.games :
    sortBy === "winrate" ? b.winrate - a.winrate :
    b.avgDelta - a.avgDelta
  );
  const display = sorted.slice(0, 50);
  const top12Chart = [...opponents].sort((a, b) => b.games - a.games).slice(0, 12);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, height: "100%", overflowY: "auto" }} className="scrollbar-thin">

      {/* ── HERO STATS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, flexShrink: 0 }}>
        {[
          { label: "Soupeři celkem", value: String(opponents.length), color: "hsl(var(--primary))" },
          { label: "Nejlepší bilance", value: c.bestOpponent.name, sub: `${c.bestOpponent.winrate}% WR`, color: green },
          { label: "Nejhorší bilance", value: c.worstOpponent.name, sub: `${c.worstOpponent.winrate}% WR`, color: red },
          { label: "Nejhranější", value: opponents[0]?.name ?? "—", sub: opponents[0] ? `${opponents[0].games} her` : "", color: amber },
        ].map(s => (
          <GC key={s.label}>
            <div style={{ padding: "12px 14px" }}>
              <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "hsl(var(--muted-foreground))", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)", color: s.color, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.value}</div>
              {s.sub && <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: s.color, marginTop: 2, opacity: 0.8 }}>{s.sub}</div>}
            </div>
          </GC>
        ))}
      </div>

      {/* ── MAIN ROW ── */}
      <div className="mobile-stack" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 10, flex: 1, minHeight: 280 }}>

        {/* Left: enriched opponent list */}
        <GC style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ padding: "14px 16px 8px", flexShrink: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)", marginBottom: 8 }}>H2H přehled</div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Hledat soupeře…"
                style={{ flex: 1, padding: "5px 10px", borderRadius: 8, border: "1px solid hsl(var(--border)/0.5)", background: "hsl(var(--muted)/0.4)", color: "hsl(var(--foreground))", fontSize: 11, fontFamily: "var(--font-mono)", outline: "none" }}
              />
              <div style={{ display: "flex", background: "hsl(var(--muted)/0.5)", borderRadius: 8, padding: 2, gap: 1 }}>
                {([["games","Hry"],["winrate","WR"],["avgDelta","Δ"]] as const).map(([k, lbl]) => (
                  <button key={k} onClick={() => setSortBy(k)}
                    style={{ fontSize: 9, fontFamily: "var(--font-mono)", padding: "3px 8px", borderRadius: 6, border: "none", cursor: "pointer", background: sortBy === k ? "hsl(var(--card))" : "transparent", color: sortBy === k ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))", fontWeight: sortBy === k ? 700 : 400 }}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "0 10px 10px" }} className="scrollbar-thin">
            {display.map((o, i) => {
              const total = o.wins + o.losses + o.draws || 1;
              const wPct = o.wins / total * 100;
              const lPct = o.losses / total * 100;
              const wrColor = o.winrate >= 55 ? green : o.winrate <= 45 ? red : amber;
              return (
                <div key={i} style={{ padding: "9px 10px", borderRadius: 10, marginBottom: 4, background: "hsl(var(--muted)/0.18)", border: "1px solid hsl(var(--border)/0.3)", transition: "background 0.15s", cursor: "default" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--muted)/0.4)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "hsl(var(--muted)/0.18)")}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, background: "hsl(var(--primary)/0.12)", color: "hsl(var(--primary))", fontFamily: "var(--font-mono)", flexShrink: 0 }}>{avatarInitials(o.name)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.name}</div>
                      <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))" }}>{o.games} her · {o.lastDate}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "var(--font-mono)", color: wrColor, lineHeight: 1 }}>{o.winrate}%</div>
                      <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: o.avgDelta >= 0 ? green : red }}>Δ {o.avgDelta >= 0 ? "+" : ""}{o.avgDelta}</div>
                    </div>
                  </div>
                  {/* W/D/L inline bar */}
                  <div style={{ display: "flex", height: 3, borderRadius: 99, overflow: "hidden", gap: 1 }}>
                    <div style={{ flex: wPct, background: green, minWidth: wPct > 0 ? 2 : 0 }} />
                    <div style={{ flex: o.draws / total * 100, background: "hsl(var(--muted-foreground)/0.35)", minWidth: o.draws > 0 ? 2 : 0 }} />
                    <div style={{ flex: lPct, background: red, minWidth: lPct > 0 ? 2 : 0 }} />
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    {[{ v: o.wins, c: green, l: "W" }, { v: o.draws, c: "hsl(var(--muted-foreground))", l: "D" }, { v: o.losses, c: red, l: "L" }].map(s => (
                      <span key={s.l} style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: s.c }}>{s.l}: {s.v}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </GC>

        {/* Right: winrate chart */}
        <GC style={{ display: "flex", flexDirection: "column" }} className="opp-chart-panel">
          <div style={{ padding: "14px 16px 0", flexShrink: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>Winrate — top soupeři</div>
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", marginTop: 2 }}>Nejhranější soupeři · zelená &gt;50%, červená &lt;50%</div>
          </div>
          <div style={{ flex: 1, padding: "8px 8px 16px 0", minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={[...top12Chart].reverse()} margin={{ top: 4, right: 52, bottom: 4, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border)/0.25)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fontFamily: "var(--font-display)", fontWeight: 600 }} width={88} tickLine={false} />
                <ReferenceLine x={50} stroke="hsl(var(--border))" strokeDasharray="4 3" strokeWidth={1.5} />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  return (
                    <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: 11, boxShadow: "0 4px 16px hsl(var(--foreground)/0.12)" }}>
                      <div style={{ fontWeight: 700, marginBottom: 3 }}>{d.name}</div>
                      <div style={{ color: d.winrate >= 50 ? green : red }}>WR: {d.winrate}%</div>
                      <div style={{ color: "hsl(var(--muted-foreground))", marginTop: 1 }}>Hry: {d.games} · W{d.wins}/L{d.losses}</div>
                      <div style={{ color: d.avgDelta >= 0 ? green : red }}>Avg Δ: {d.avgDelta >= 0 ? "+" : ""}{d.avgDelta}</div>
                    </div>
                  );
                }} />
                <Bar dataKey="winrate" name="Winrate %" radius={[0, 5, 5, 0]} maxBarSize={18}>
                  {[...top12Chart].reverse().map((d, i) => (
                    <Cell key={i} fill={d.winrate >= 55 ? green : d.winrate <= 45 ? red : amber} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GC>
      </div>
    </div>
  );
}

// ─── Tournaments Tab ──────────────────────────────────────────────────────────
function TournamentsTab({ data }: { data: PlayerDetailData }) {
  const { tournamentPerf } = data;
  const green = "hsl(142,65%,50%)";
  const red = "hsl(0,65%,55%)";
  const amber = "hsl(42,80%,55%)";

  const bestT = tournamentPerf.reduce((b, t) => t.totalDelta > (b?.totalDelta ?? -Infinity) ? t : b, tournamentPerf[0]);
  const worstT = tournamentPerf.reduce((b, t) => t.totalDelta < (b?.totalDelta ?? Infinity) ? t : b, tournamentPerf[0]);
  const mostGamesT = tournamentPerf.reduce((b, t) => t.games > (b?.games ?? 0) ? t : b, tournamentPerf[0]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, height: "100%", overflowY: "auto" }} className="scrollbar-thin">

      {/* ── HERO STATS ── */}
      {tournamentPerf.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, flexShrink: 0 }}>
          {[
            { label: "Turnaje celkem", value: String(tournamentPerf.length), color: "hsl(var(--primary))" },
            { label: "Nejlepší turnaj", value: bestT?.name ?? "—", sub: bestT ? `+${bestT.totalDelta} ELO` : "", color: green },
            { label: "Nejhorší turnaj", value: worstT?.name ?? "—", sub: worstT ? `${worstT.totalDelta} ELO` : "", color: red },
            { label: "Nejvíce her", value: mostGamesT?.name ?? "—", sub: mostGamesT ? `${mostGamesT.games} zápasů` : "", color: amber },
          ].map(s => (
            <GC key={s.label}>
              <div style={{ padding: "12px 14px" }}>
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "hsl(var(--muted-foreground))", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)", color: s.color, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.value}</div>
                {s.sub && <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: s.color, marginTop: 2, opacity: 0.85 }}>{s.sub}</div>}
              </div>
            </GC>
          ))}
        </div>
      )}

      {/* ── MAIN GRID ── */}
      <div className="mobile-stack" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flex: 1, minHeight: 320 }}>

        {/* Left: enriched tournament cards */}
        <GC style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 16px 8px", flexShrink: 0, fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>ELO výkon per turnaj</div>
          <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 12px" }} className="scrollbar-thin">
            {tournamentPerf.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", fontSize: 12 }}>Žádná turnajová data</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {tournamentPerf.map((t, i) => {
                  const winPct = t.games > 0 ? t.wins / t.games * 100 : 0;
                  const lossPct = t.games > 0 ? t.losses / t.games * 100 : 0;
                  const drawPct = t.games > 0 ? (t.games - t.wins - t.losses) / t.games * 100 : 0;
                  const accentColor = t.totalDelta >= 10 ? green : t.totalDelta <= -10 ? red : amber;
                  return (
                    <div key={i} style={{ padding: "10px 12px", borderRadius: 11, background: "hsl(var(--muted)/0.18)", border: `1px solid ${accentColor}28`, borderLeft: `3px solid ${accentColor}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
                          <div style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                            {t.games} her · {t.wins}W / {t.losses}L{t.games - t.wins - t.losses > 0 ? ` / ${t.games - t.wins - t.losses}D` : ""}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-mono)", color: accentColor, lineHeight: 1 }}>
                            {t.totalDelta >= 0 ? "+" : ""}{t.totalDelta}
                          </div>
                          <div style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>
                            avg {t.avgDelta >= 0 ? "+" : ""}{t.avgDelta}
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: 7, height: 3, borderRadius: 99, background: "hsl(var(--muted))", overflow: "hidden", display: "flex", gap: 1 }}>
                        <div style={{ flex: winPct, background: green, minWidth: winPct > 0 ? 2 : 0 }} />
                        <div style={{ flex: drawPct, background: "hsl(var(--muted-foreground)/0.35)", minWidth: drawPct > 0 ? 2 : 0 }} />
                        <div style={{ flex: lossPct, background: red, minWidth: lossPct > 0 ? 2 : 0 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </GC>

        {/* Right: avg delta chart */}
        <GC style={{ display: "flex", flexDirection: "column" }} className="tour-chart-panel">
          <div style={{ padding: "14px 16px 4px", flexShrink: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>Průměrná Δ ELO per turnaj</div>
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", marginTop: 2 }}>Průměrný zisk/ztráta na zápas</div>
          </div>
          <div style={{ flex: 1, padding: "4px 8px 12px 4px", minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tournamentPerf.slice(0, 14)} margin={{ top: 8, right: 12, bottom: 48, left: 4 }}>
                <defs>
                  <linearGradient id="tGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={green} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={green} stopOpacity={0.5} />
                  </linearGradient>
                  <linearGradient id="tRed" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor={red} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={red} stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.25)" />
                <XAxis dataKey="name" tick={{ fontSize: 8, fontFamily: "var(--font-mono)", fill: "hsl(var(--muted-foreground))" }} angle={-40} textAnchor="end" height={52} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} width={30} tickLine={false} axisLine={false} />
                <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1.5} />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  return (
                    <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: 11, boxShadow: "0 4px 16px hsl(var(--foreground)/0.12)" }}>
                      <div style={{ fontWeight: 700, marginBottom: 3, color: "hsl(var(--foreground))" }}>{d.name}</div>
                      <div style={{ color: d.avgDelta >= 0 ? green : red }}>Avg Δ: {d.avgDelta >= 0 ? "+" : ""}{d.avgDelta}</div>
                      <div style={{ color: d.totalDelta >= 0 ? green : red }}>Celkem: {d.totalDelta >= 0 ? "+" : ""}{d.totalDelta}</div>
                      <div style={{ color: "hsl(var(--muted-foreground))", marginTop: 1 }}>{d.games} her · {d.wins}W/{d.losses}L</div>
                    </div>
                  );
                }} />
                <Bar dataKey="avgDelta" name="Avg Δ ELO" radius={[4, 4, 0, 0]} maxBarSize={32}>
                  {tournamentPerf.slice(0, 14).map((d, i) => (
                    <Cell key={i} fill={d.avgDelta >= 0 ? `url(#tGreen)` : `url(#tRed)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GC>
      </div>
    </div>
  );
}

// ─── History Tab ──────────────────────────────────────────────────────────────
function HistoryTab({ data }: { data: PlayerDetailData }) {
  const green  = "hsl(142,65%,50%)";
  const red    = "hsl(0,65%,55%)";
  const amber  = "hsl(42,80%,55%)";
  const muted  = "hsl(var(--muted-foreground))";

  const [search, setSearch]     = useState("");
  const [filterResult, setFilterResult] = useState<"all"|"Won"|"Lost"|"Draw">("all");
  const [filterTournament, setFilterTournament] = useState("all");
  const [page, setPage]         = useState(0);
  const PAGE_SIZE = 30;

  const history = data.matchHistory ?? [];

  const tournaments = Array.from(new Set(history.map(m => m.tournamentType).filter(Boolean))).sort();

  const filtered = history.filter(m => {
    if (filterResult !== "all" && m.result !== filterResult) return false;
    if (filterTournament !== "all" && m.tournamentType !== filterTournament) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!m.opponent.toLowerCase().includes(q) && !m.tournament.toLowerCase().includes(q) && !m.date.includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData   = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Reset page when filters change
  const handleFilter = (fn: () => void) => { fn(); setPage(0); };

  const resultColor = (r: "Won"|"Lost"|"Draw") => r === "Won" ? green : r === "Lost" ? red : amber;
  const resultLabel = (r: "Won"|"Lost"|"Draw") => r === "Won" ? "V" : r === "Lost" ? "P" : "R";

  const wins   = filtered.filter(m => m.result === "Won").length;
  const losses = filtered.filter(m => m.result === "Lost").length;
  const draws  = filtered.filter(m => m.result === "Draw").length;
  const totalDelta = filtered.reduce((s, m) => s + m.delta, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, height: "100%", overflow: "hidden" }}>

      {/* ── Filters bar ── */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", flexShrink: 0 }}>
        {/* Search */}
        <input
          value={search}
          onChange={e => handleFilter(() => setSearch(e.target.value))}
          placeholder="Hledat soupeře, turnaj, datum…"
          style={{ flex: 1, minWidth: 180, padding: "6px 10px", borderRadius: 8, border: "1px solid hsl(var(--border)/0.5)", background: "hsl(var(--muted)/0.4)", color: "hsl(var(--foreground))", fontSize: 12, fontFamily: "var(--font-mono)", outline: "none" }}
        />
        {/* Result filter */}
        <div style={{ display: "flex", gap: 3 }}>
          {(["all","Won","Lost","Draw"] as const).map(r => (
            <button key={r} onClick={() => handleFilter(() => setFilterResult(r))}
              style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid", fontSize: 11, fontFamily: "var(--font-mono)", cursor: "pointer",
                borderColor: filterResult === r ? (r === "Won" ? green : r === "Lost" ? red : r === "Draw" ? amber : "hsl(var(--primary))") : "hsl(var(--border)/0.4)",
                background: filterResult === r ? (r === "Won" ? `${green}22` : r === "Lost" ? `${red}22` : r === "Draw" ? `${amber}22` : "hsl(var(--primary)/0.15)") : "transparent",
                color: filterResult === r ? (r === "Won" ? green : r === "Lost" ? red : r === "Draw" ? amber : "hsl(var(--primary))") : muted,
              }}>
              {r === "all" ? "Vše" : r === "Won" ? "Výhra" : r === "Lost" ? "Prohra" : "Remíza"}
            </button>
          ))}
        </div>
        {/* Tournament type filter */}
        {tournaments.length > 0 && (
          <select value={filterTournament} onChange={e => handleFilter(() => setFilterTournament(e.target.value))}
            style={{ padding: "5px 8px", borderRadius: 8, border: "1px solid hsl(var(--border)/0.5)", background: "hsl(var(--muted)/0.4)", color: "hsl(var(--foreground))", fontSize: 11, fontFamily: "var(--font-mono)", cursor: "pointer" }}>
            <option value="all">Všechny typy</option>
            {tournaments.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
      </div>

      {/* ── Summary strip ── */}
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        {[
          { label: "Celkem", value: filtered.length, color: "hsl(var(--foreground))" },
          { label: "Výhry", value: wins, color: green },
          { label: "Prohry", value: losses, color: red },
          { label: "Remízy", value: draws, color: amber },
          { label: "WR%", value: filtered.length > 0 ? `${Math.round(wins / filtered.length * 100)}%` : "—", color: wins / (filtered.length||1) >= 0.5 ? green : red },
          { label: "Σ ELO", value: (totalDelta >= 0 ? "+" : "") + totalDelta, color: totalDelta >= 0 ? green : red },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, padding: "7px 10px", borderRadius: 10, background: "hsl(var(--muted)/0.3)", border: "1px solid hsl(var(--border)/0.35)", textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--font-mono)", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 9, color: muted, marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div style={{ flex: 1, overflow: "hidden", borderRadius: 12, border: "1px solid hsl(var(--border)/0.4)", background: "hsl(var(--card)/0.6)", backdropFilter: "blur(12px)", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div className="history-row" style={{ display: "grid", gridTemplateColumns: "90px 1fr 130px 90px 90px 80px 70px", gap: 0, padding: "8px 14px", borderBottom: "1px solid hsl(var(--border)/0.4)", flexShrink: 0 }}>
          {["Datum", "Soupeř", "Turnaj", "ELO před", "ELO po", "Změna", "Výsledek"].map(h => (
            <div key={h} className="history-cell" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: muted, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</div>
          ))}
        </div>
        {/* Rows */}
        <div style={{ flex: 1, overflowY: "auto" }} className="scrollbar-thin">
          {pageData.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: muted, fontFamily: "var(--font-mono)", fontSize: 12 }}>Žádné zápasy neodpovídají filtru</div>
          ) : pageData.map((m, i) => (
            <div key={`${m.matchId}-${i}`}
              className="history-row"
              style={{ display: "grid", gridTemplateColumns: "90px 1fr 130px 90px 90px 80px 70px", gap: 0, padding: "9px 14px", borderBottom: "1px solid hsl(var(--border)/0.2)", transition: "background 0.12s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--muted)/0.35)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              {/* Datum */}
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: muted }}>{m.date}</div>
              {/* Soupeř */}
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: "hsl(var(--muted)/0.5)", border: "1px solid hsl(var(--border)/0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: muted, flexShrink: 0 }}>
                  {m.opponent.slice(0,2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "var(--font-display)" }}>{m.opponent}</div>
                  {m.opponentElo > 0 && <div style={{ fontSize: 10, color: muted, fontFamily: "var(--font-mono)" }}>{m.opponentElo} ELO</div>}
                </div>
              </div>
              {/* Turnaj */}
              <div style={{ fontSize: 10, color: muted, fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={m.tournament}>
                <span style={{ padding: "2px 6px", borderRadius: 5, background: "hsl(var(--muted)/0.5)", fontSize: 9 }}>{m.tournamentType || "—"}</span>
                <div style={{ marginTop: 2, fontSize: 9, opacity: 0.7 }}>{m.tournament}</div>
              </div>
              {/* ELO před */}
              <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "hsl(var(--foreground))" }}>{m.myEloBefore}</div>
              {/* ELO po */}
              <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "hsl(var(--foreground))", fontWeight: 600 }}>{m.myEloAfter}</div>
              {/* Změna */}
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)", color: resultColor(m.result) }}>
                {m.delta >= 0 ? "+" : ""}{m.delta}
              </div>
              {/* Výsledek */}
              <div>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 8, background: `${resultColor(m.result)}22`, border: `1px solid ${resultColor(m.result)}55`, fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", color: resultColor(m.result) }}>
                  {resultLabel(m.result)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 14px", borderTop: "1px solid hsl(var(--border)/0.3)", flexShrink: 0 }}>
            <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0}
              style={{ padding: "4px 12px", borderRadius: 7, border: "1px solid hsl(var(--border)/0.4)", background: "transparent", color: page === 0 ? muted : "hsl(var(--foreground))", cursor: page === 0 ? "default" : "pointer", fontSize: 12, opacity: page === 0 ? 0.4 : 1 }}>‹</button>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: muted }}>
              {page + 1} / {totalPages} · {filtered.length} zápasů
            </span>
            <button onClick={() => setPage(p => Math.min(totalPages-1, p+1))} disabled={page === totalPages-1}
              style={{ padding: "4px 12px", borderRadius: 7, border: "1px solid hsl(var(--border)/0.4)", background: "transparent", color: page === totalPages-1 ? muted : "hsl(var(--foreground))", cursor: page === totalPages-1 ? "default" : "pointer", fontSize: 12, opacity: page === totalPages-1 ? 0.4 : 1 }}>›</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function PlayerDetailView() {
  const { selectedPlayer, playerSubView } = useAppNav();
  const { mode } = useRatingMode();
  const [data, setData] = useState<PlayerDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [communityRecords, setCommunityRecords] = useState<RecordsData | null>(null);

  useEffect(() => {
    if (!selectedPlayer) return;
    setLoading(true); setError(false); setData(null);
    fetch(`/api/player-detail?mode=${mode}&name=${encodeURIComponent(selectedPlayer.name)}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [selectedPlayer?.name, mode]);

  useEffect(() => {
    if (!selectedPlayer) return;
    fetch(`/api/records?mode=${mode}`)
      .then(r => r.json())
      .then(d => setCommunityRecords(d))
      .catch(() => {});
  }, [selectedPlayer?.name, mode]);

  if (!selectedPlayer) return null;

  if (loading) return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
      {[1,2,3].map(i => <Skeleton key={i} h={i === 2 ? 180 : 90} />)}
      <style jsx global>{`@keyframes pd-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );

  if (error || !data) return (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 14, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))" }}>Nepodařilo se načíst data pro {selectedPlayer.name}</div>
      <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground)/0.7)", fontFamily: "var(--font-mono)" }}>Zkus znovu nebo zkontroluj propojení s Google Sheets</div>
    </div>
  );

  return (
    <div style={{ height: "100%", overflow: "hidden" }}>
      {playerSubView === "overview"    && <OverviewTab    data={data} communityRecords={communityRecords} />}
      {playerSubView === "opponents"   && <OpponentsTab   data={data} />}
      {playerSubView === "tournaments" && <TournamentsTab data={data} />}
      {playerSubView === "history"     && <HistoryTab     data={data} />}
      <style jsx global>{`@keyframes pd-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}
