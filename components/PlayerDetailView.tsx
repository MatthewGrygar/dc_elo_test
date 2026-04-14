"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppNav } from "./AppContext";
import { useRatingMode } from "./RatingModeProvider";
import { t, Lang } from "@/lib/i18n";
import { avatarInitials } from "@/lib/utils";
import { CountryFlag } from "./CountryFlag";
import { PlayerDetailData, RecordsData } from "@/lib/dataFetchers";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell,
} from "recharts";
import {
  TrendingUp, TrendingDown, Swords, Star, Award, Shield, Target,
  Zap, Activity, Calendar, Clock, Trophy, BarChart2, Users, Flame, ChevronDown,
} from "lucide-react";

type SuperTag = { id: string; label: string; color?: string; icon?: string };

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
function OverviewTab({ data, communityRecords, superTags }: { data: PlayerDetailData; communityRecords?: RecordsData | null; superTags?: SuperTag[] }) {
  const { selectedPlayer, lang } = useAppNav();
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
                <div style={{ fontWeight: 800, fontSize: 16, fontFamily: "var(--font-display)", letterSpacing: "-0.03em", lineHeight: 1.15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {s.name}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 9, padding: "1px 7px", borderRadius: 99, background: "hsl(var(--primary) / 0.12)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.28)", fontFamily: "var(--font-mono)", fontWeight: 700, letterSpacing: "0.06em" }}>{mode}</span>
                  {(() => {
                    const vtc = (selectedPlayer as any)?.vtClass as keyof typeof VT_META | undefined;
                    const m = vtc ? VT_META[vtc] : null;
                    return m ? <span style={{ fontSize: 9, padding: "1px 7px", borderRadius: 99, background: m.bg, color: m.color, border: `1px solid ${m.border}`, fontFamily: "var(--font-mono)", fontWeight: 700 }}>{m.label}</span> : null;
                  })()}
                  {superTags && superTags.map(tag => {
                    const c = tag.color ?? "hsl(152,72%,45%)";
                    return (
                      <span key={tag.id} style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: `${c}33`, color: c, border: `1px solid ${c}77`, fontFamily: "var(--font-mono)", display: "inline-flex", alignItems: "center", gap: 3, boxShadow: `0 0 6px ${c}40` }}>
                        {tag.icon && <span style={{ fontSize: 12 }}>{tag.icon}</span>}
                        {tag.label}
                      </span>
                    );
                  })}
                  {(selectedPlayer as any)?.country && (
                    <CountryFlag code={(selectedPlayer as any).country} showCode />
                  )}
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
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", letterSpacing: "0.1em", textTransform: "uppercase" }}>{t(lang, "pd_win_loss_draw")}</div>
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
                { label: t(lang, "wins"), short: "W", value: s.wins, color: green, pct: wPct },
                { label: t(lang, "losses"), short: "L", value: s.losses, color: red, pct: lPct },
                { label: t(lang, "draws"), short: "D", value: s.draws, color: amber, pct: dPct },
              ].map(r => (
                <div key={r.short} style={{ flex: 1, padding: "8px 6px", borderRadius: 10, background: `${r.color}12`, border: `1px solid ${r.color}30`, textAlign: "center", display: "flex", flexDirection: "column", gap: 1 }}>
                  <div style={{ fontSize: 26, fontWeight: 900, fontFamily: "var(--font-mono)", color: r.color, lineHeight: 1, letterSpacing: "-0.03em" }}>{r.value}</div>
                  <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginTop: 2 }}>{r.label}</div>
                  <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600, color: r.color, opacity: 0.75 }}>{r.pct}%</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))" }}>{s.totalGames} {t(lang, "pd_her_label")}</span>
              <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 700, color: s.winrate >= 0.5 ? green : red }}>WR {(s.winrate * 100).toFixed(1)}%</span>
            </div>
          </div>
        </GC>

        {/* Panel 3 — Perf stats */}
        <GC>
          <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8, height: "100%" }}>
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", letterSpacing: "0.1em", textTransform: "uppercase" }}>{t(lang, "pd_performance")}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, flex: 1, alignContent: "start" }}>
              <div style={{ padding: "7px 10px", borderRadius: 9, background: "hsl(var(--muted)/0.35)", border: "1px solid hsl(var(--border)/0.4)" }}>
                <div style={{ fontSize: 8, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{t(lang, "pd_perf_rating")}</div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-mono)", color: "hsl(var(--primary))" }}>{fmt(c.performanceRating)}</div>
              </div>
              <div style={{ padding: "7px 10px", borderRadius: 9, background: "hsl(var(--muted)/0.35)", border: "1px solid hsl(var(--border)/0.4)" }}>
                <div style={{ fontSize: 8, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{t(lang, "pd_bayesian_wr")}</div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-mono)", color: "hsl(var(--primary))" }}>{s.bayesianWR ?? "—"}</div>
              </div>
              <div style={{ padding: "7px 10px", borderRadius: 9, background: "hsl(var(--muted)/0.35)", border: "1px solid hsl(var(--border)/0.4)" }}>
                <div style={{ fontSize: 8, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{t(lang, "pd_expected_wins")}</div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-mono)", color: c.expectedWinDiff >= 0 ? green : red }}>{c.expectedWinDiff >= 0 ? "+" : ""}{c.expectedWinDiff.toFixed(1)}</div>
              </div>
              <div style={{ padding: "7px 10px", borderRadius: 9, background: "hsl(var(--muted)/0.35)", border: "1px solid hsl(var(--border)/0.4)" }}>
                <div style={{ fontSize: 8, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{t(lang, "pd_avg_opp")}</div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-mono)", color: "hsl(var(--foreground))" }}>{fmt(s.avgOppElo)}</div>
              </div>
            </div>
          </div>
        </GC>
      </div>

      {/* ── RECORD TAGS ── */}
      {(() => {
        const CAT_CHIP_COLORS: Record<string, string> = {
          "👑": "hsl(38,75%,44%)",  "📈": "hsl(142,55%,32%)", "🔥": "hsl(22,80%,44%)",
          "⚡": "hsl(260,55%,48%)", "⚔️": "hsl(0,58%,44%)",   "🏆": "hsl(38,75%,44%)",
          "📊": "hsl(210,60%,42%)",
        };
        const playerRecs = communityRecords?.categories.flatMap(cat =>
          cat.records
            .filter(r => r.entry?.player === s.name)
            .map(r => ({ label: r.label, value: r.entry!.value, isAllTime: r.entry!.isAllTime, catIcon: cat.icon }))
        ) ?? [];
        if (playerRecs.length === 0) return null;
        return (
          <GC style={{ flexShrink: 0 }}>
            <div style={{ padding: "14px 18px 16px" }}>
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 12 }}>{t(lang, "pd_record_tags")}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center" }}>
                {playerRecs.map((r, i) => {
                  const bg = CAT_CHIP_COLORS[r.catIcon] ?? "hsl(var(--primary))";
                  return (
                    <span key={i} title={`${r.label}: ${r.value}`} style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "5px 10px", borderRadius: 6,
                      background: bg, color: "#fff",
                      fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600,
                      whiteSpace: "nowrap", letterSpacing: "0.01em",
                      boxShadow: `0 1px 4px ${bg}55`,
                    }}>
                      {r.isAllTime && <span style={{ fontSize: 9 }}>👑</span>}{r.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </GC>
        );
      })()}

      {/* ── ELO CHART ── */}
      <GC style={{ flexShrink: 0 }}>
        <div style={{ padding: "14px 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-display)" }}>{t(lang, "pd_elo_time")} — {mode}</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", background: "hsl(var(--muted)/0.5)", borderRadius: 8, padding: 2, gap: 2 }}>
              {([["matchid", t(lang, "pd_match_id")], ["date", t(lang, "pd_hist_date")]] as ["matchid" | "date", string][]).map(([v, label]) => (
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
            <SH>{t(lang, "pd_elo_overview")}</SH>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <KV label={t(lang, "pd_peak_elo")} value={fmt(s.peakElo)} color={amber} size="lg" />
              <KV label={t(lang, "pd_min_elo")} value={fmt(s.minElo)} color={red} size="md" />
              <KV label={t(lang, "pd_elo_range")} value={fmt(c.eloRange)} />
              <KV label={t(lang, "pd_days_from_peak")} value={s.daysSincePeak > 0 ? `${s.daysSincePeak}d` : t(lang, "pd_current_peak")} color={s.daysSincePeak <= 7 ? green : "hsl(var(--foreground))"} />
              <KV label={t(lang, "pd_peak_retention")} value={`${c.peakRetention}%`} color={c.peakRetention >= 90 ? green : amber} />
              <KV label={t(lang, "pd_bayesian_wr")} value={s.bayesianWR ?? "—"} color="hsl(var(--primary))" />
            </div>
            <div style={{ marginTop: 2 }}>
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", marginBottom: 4 }}>{t(lang, "pd_peak_retention")}</div>
              <div style={{ height: 5, borderRadius: 99, background: "hsl(var(--muted))" }}>
                <div style={{ height: "100%", width: `${c.peakRetention}%`, background: c.peakRetention >= 90 ? green : amber, borderRadius: 99 }} />
              </div>
            </div>
          </div>
        </GC>

        {/* Activity */}
        <GC>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            <SH>{t(lang, "pd_activity")}</SH>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <KV label={t(lang, "pd_total_games")} value={fmt(s.totalGames)} />
              <KV label={t(lang, "pd_avg_opp_elo")} value={fmt(s.avgOppElo)} />
              <KV label={t(lang, "pd_delta_7d")} value={(c.eloChange7d >= 0 ? "+" : "") + fmt(c.eloChange7d)} color={c.eloChange7d >= 0 ? green : red} />
              <KV label={t(lang, "pd_delta_30d")} value={(c.eloChange30d >= 0 ? "+" : "") + fmt(c.eloChange30d)} color={c.eloChange30d >= 0 ? green : red} />
              <KV label={t(lang, "pd_avg_change")} value={fmtS(c.avgDelta)} color={c.avgDelta >= 0 ? green : red} />
              <KV label={t(lang, "pd_ev_match")} value={fmtS(c.ev)} color={c.ev >= 0 ? green : red} />
              <KV label={t(lang, "pd_max_gain")} value={`+${fmt(c.biggestSingleGain)}`} color={green} size="sm" />
              <KV label={t(lang, "pd_max_loss")} value={fmt(c.biggestSingleLoss)} color={red} size="sm" />
              <KV label={t(lang, "pd_perf_rating")} value={fmt(c.performanceRating)} color="hsl(var(--primary))" size="sm" />
              <KV label={t(lang, "pd_elo_ceiling")} value={`~${fmt(c.eloCeilingEstimate)}`} color={amber} size="sm" />
            </div>
          </div>
        </GC>

        {/* Soupeřský blok */}
        <GC>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            <SH>{t(lang, "pd_opp_block")}</SH>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {[
                { label: t(lang, "pd_wr_weaker"), value: `${c.winVsWeaker}%`, color: c.winVsWeaker >= 60 ? green : amber },
                { label: t(lang, "pd_wr_similar"), value: `${c.winVsSimilar}%`, color: c.winVsSimilar >= 50 ? green : red },
                { label: t(lang, "pd_wr_stronger"), value: `${c.winVsStronger}%`, color: c.winVsStronger >= 40 ? green : red },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 8px", borderRadius: 8, background: "hsl(var(--muted)/0.3)" }}>
                  <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{r.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-mono)", color: r.color }}>{r.value}</div>
                </div>
              ))}
            </div>
            <div style={{ paddingTop: 8, borderTop: "1px solid hsl(var(--border)/0.3)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <div>
                <div style={{ fontSize: 9, color: red, fontFamily: "var(--font-mono)", marginBottom: 1 }}>{t(lang, "pd_nemesis")}</div>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-display)" }}>{c.nemesis ?? "—"}</div>
                {c.nemesis && c.nemesis !== "—" && <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>WR: {c.nemesisWR}%</div>}
              </div>
              <div>
                <div style={{ fontSize: 9, color: green, fontFamily: "var(--font-mono)", marginBottom: 1 }}>{t(lang, "pd_prey")}</div>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-display)" }}>{c.prey ?? "—"}</div>
                {c.prey && c.prey !== "—" && <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>WR: {c.preyWR}%</div>}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{t(lang, "pd_most_freq_opp")}</div>
              <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)" }}>{c.mostPlayedOpponent.name}</div>
              <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{c.mostPlayedOpponent.games} {t(lang, "pd_games_dot")} {c.mostPlayedOpponent.winrate}% {t(lang, "pd_wr")}</div>
            </div>
          </div>
        </GC>
      </div>

      {/* ── STATS ROW 2: Advanced indices + Streak block ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 10, flexShrink: 0 }}>
        {/* Pokročilé indexy */}
        <GC>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            <SH>{t(lang, "pd_advanced")}</SH>
            <IndexBar label={t(lang, "pd_stability")} value={c.stabilityIndex} tip={t(lang, "pd_stability_hint")} />
            <IndexBar label={t(lang, "pd_momentum")} value={c.momentumIndex} tip={t(lang, "pd_momentum_hint")} />
            <IndexBar label={t(lang, "pd_consistency")} value={c.consistencyScore} tip={t(lang, "pd_consistency_hint")} />
            <IndexBar label={t(lang, "pd_clutch")} value={c.clutchFactor} tip={t(lang, "pd_clutch_hint")} />
            <IndexBar label={t(lang, "pd_tilt")} value={c.tiltIndex} tip={t(lang, "pd_tilt_hint")} />
            <IndexBar label={t(lang, "pd_clutch_pressure")} value={c.clutchUnderPressure} tip={t(lang, "pd_clutch_pressure_hint")} />
            <div style={{ marginTop: 4, paddingTop: 10, borderTop: "1px solid hsl(var(--border)/0.3)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <KV label={t(lang, "pd_gain_loss")} value={c.gainLossRatio.toFixed(2)} color={c.gainLossRatio >= 1 ? green : red} size="sm" />
              <KV label={t(lang, "pd_upset_rate")} value={`${c.upsetRate}%`} size="sm" />
              <KV label={t(lang, "pd_choking")} value={`${c.chokingIndex}%`} color={c.chokingIndex >= 30 ? red : amber} size="sm" />
              <KV label={t(lang, "pd_hot_hand")} value={fmtS(c.hotHandEffect, 2)} color={c.hotHandEffect > 0.15 ? green : "hsl(var(--foreground))"} size="sm" />
              <KV label={t(lang, "pd_oqa_wr")} value={`${c.oqaWR}%`} color="hsl(var(--primary))" size="sm" />
              <KV label={t(lang, "pd_true_skill")} value={`±${c.trueSkillSigma}`} color="hsl(var(--muted-foreground))" size="sm" />
            </div>
          </div>
        </GC>

        {/* Streak blok */}
        <GC>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            <SH>{t(lang, "pd_streak_block")}</SH>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <div style={{ padding: "8px 10px", borderRadius: 10, background: `${green}15`, border: `1px solid ${green}35`, textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{t(lang, "pd_longest_win")}</div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)", color: green }}>{s.longestWinStreak}×</div>
              </div>
              <div style={{ padding: "8px 10px", borderRadius: 10, background: `${red}15`, border: `1px solid ${red}35`, textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{t(lang, "pd_longest_lose")}</div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)", color: red }}>{s.longestLoseStreak}×</div>
              </div>
              <div style={{ padding: "8px 10px", borderRadius: 10, background: "hsl(var(--muted)/0.3)", border: "1px solid hsl(var(--border)/0.4)", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{t(lang, "pd_no_loss")}</div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)", color: amber }}>{c.longestUnbeaten ?? 0}×</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
              <KV label={t(lang, "pd_tilt_recovery")} value={`${c.tiltRecovery ?? 0}%`} color={(c.tiltRecovery ?? 0) >= 50 ? green : red} />
              <KV label={t(lang, "pd_comeback_rate")} value={`${c.comebackRate ?? 0}%`} color={(c.comebackRate ?? 0) >= 50 ? green : amber} />
              <KV label={t(lang, "pd_biggest_comeback")} value={`+${fmt(c.biggestComeback ?? 0)}`} color={green} />
              <KV label={t(lang, "pd_grind_eff")} value={fmtS(c.grindEfficiency, 2)} color="hsl(var(--primary))" />
              <KV label={t(lang, "pd_best_month")} value={c.bestMonth ?? "—"} size="sm" />
              <KV label={t(lang, "pd_best_month_gain")} value={c.bestMonthGain > 0 ? `+${fmt(c.bestMonthGain)}` : "—"} color={green} size="sm" />
              <KV label={t(lang, "pd_worst_month")} value={c.worstMonth ?? "—"} size="sm" />
              <KV label={t(lang, "pd_worst_month_loss")} value={c.worstMonthLoss < 0 ? fmt(c.worstMonthLoss) : "—"} color={red} size="sm" />
            </div>
          </div>
        </GC>

        {/* ELO Brackets */}
        <GC>
          <div style={{ padding: "14px 16px 0", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)" }}>{t(lang, "pd_wr_elo_range")}</div>
          <div style={{ padding: "10px 16px 16px" }}>
            {(c.eloBrackets ?? []).map((b, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "hsl(var(--foreground))", fontWeight: 500 }}>{b.bracket}</div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{b.games} {t(lang, "pd_her_label")}</span>
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
          <div style={{ padding: "14px 16px 0", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)" }}>{t(lang, "pd_delta_dist")}</div>
          <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", padding: "0 16px 0" }}>{t(lang, "pd_delta_sub")}</div>
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


        {/* Rolling momentum */}
        <GC>
          <div style={{ padding: "14px 16px 0", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)" }}>{t(lang, "pd_rolling_mom")}</div>
          <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", padding: "0 16px 0" }}>{t(lang, "pd_rolling_sub")}</div>
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
          <div style={{ padding: "14px 16px 0", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)" }}>{t(lang, "pd_wr_opp")}</div>
          <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", padding: "0 16px 0" }}>{t(lang, "pd_wr_opp_sub")}</div>
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
  const { lang } = useAppNav();
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
          { label: t(lang, "pd_opp_count"), value: String(opponents.length), color: "hsl(var(--primary))" },
          { label: t(lang, "pd_best_record"), value: c.bestOpponent.name, sub: `${c.bestOpponent.winrate}% WR`, color: green },
          { label: t(lang, "pd_worst_record"), value: c.worstOpponent.name, sub: `${c.worstOpponent.winrate}% WR`, color: red },
          { label: t(lang, "pd_most_played"), value: opponents[0]?.name ?? "—", sub: opponents[0] ? `${opponents[0].games} ${t(lang, "pd_her_label")}` : "", color: amber },
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
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)", marginBottom: 8 }}>{t(lang, "pd_h2h")}</div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t(lang, "pd_search_opp")}
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
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>{t(lang, "pd_wr_top_opp")}</div>
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", marginTop: 2 }}>{t(lang, "pd_wr_top_opp_sub")}</div>
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
  const { lang } = useAppNav();
  const green = "hsl(142,65%,50%)";
  const red = "hsl(0,65%,55%)";
  const amber = "hsl(42,80%,55%)";
  const [expanded, setExpanded] = useState<string | null>(null);

  const parseCzTs = (s: string): number => {
    const [d, m, y] = s.split(".");
    return new Date(+y, +m - 1, +d).getTime();
  };

  // Build tournament list from matchHistory, sorted newest first
  const tournaments = useMemo(() => {
    const map = new Map<string, {
      games: { opponent: string; opponentElo: number; result: "Won" | "Lost" | "Draw"; delta: number; date: string }[];
      wins: number; losses: number; draws: number; totalDelta: number; latestDate: number;
    }>();
    for (const m of data.matchHistory ?? []) {
      if (!m.tournament) continue;
      if (!map.has(m.tournament)) map.set(m.tournament, { games: [], wins: 0, losses: 0, draws: 0, totalDelta: 0, latestDate: 0 });
      const v = map.get(m.tournament)!;
      const ts = parseCzTs(m.date);
      if (ts > v.latestDate) v.latestDate = ts;
      v.totalDelta += m.delta;
      if (m.result === "Won") v.wins++;
      else if (m.result === "Lost") v.losses++;
      else v.draws++;
      v.games.push({ opponent: m.opponent, opponentElo: m.opponentElo, result: m.result, delta: m.delta, date: m.date });
    }
    return [...map.entries()]
      .map(([name, v]) => ({
        name,
        games: [...v.games].sort((a, b) => parseCzTs(b.date) - parseCzTs(a.date)),
        wins: v.wins, losses: v.losses, draws: v.draws,
        totalGames: v.wins + v.losses + v.draws,
        totalDelta: Math.round(v.totalDelta),
        avgDelta: (v.wins + v.losses + v.draws) > 0 ? Math.round(v.totalDelta / (v.wins + v.losses + v.draws)) : 0,
        latestDate: v.latestDate,
      }))
      .sort((a, b) => b.latestDate - a.latestDate);
  }, [data.matchHistory]);

  const bestT    = tournaments.length ? tournaments.reduce((b, t) => t.totalDelta > b.totalDelta ? t : b) : null;
  const worstT   = tournaments.length ? tournaments.reduce((b, t) => t.totalDelta < b.totalDelta ? t : b) : null;
  const mostGamesT = tournaments.length ? tournaments.reduce((b, t) => t.totalGames > b.totalGames ? t : b) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, height: "100%", overflowY: "auto" }} className="scrollbar-thin">

      {/* ── HERO STATS ── */}
      {tournaments.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, flexShrink: 0 }}>
          {[
            { label: t(lang, "pd_tour_count"), value: String(tournaments.length), color: "hsl(var(--primary))" },
            { label: t(lang, "pd_best_tour"), value: bestT?.name ?? "—", sub: bestT ? `${bestT.totalDelta >= 0 ? "+" : ""}${bestT.totalDelta} ELO` : "", color: green },
            { label: t(lang, "pd_worst_tour"), value: worstT?.name ?? "—", sub: worstT ? `${worstT.totalDelta} ELO` : "", color: red },
            { label: t(lang, "pd_most_games_tour"), value: mostGamesT?.name ?? "—", sub: mostGamesT ? `${mostGamesT.totalGames} ${t(lang, "pd_zapasu_label")}` : "", color: amber },
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

      {/* ── TOURNAMENT LIST ── */}
      {tournaments.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", fontSize: 12 }}>{t(lang, "pd_no_tour_data")}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {tournaments.map((tour) => {
            const isOpen = expanded === tour.name;
            const accentColor = tour.totalDelta >= 10 ? green : tour.totalDelta <= -10 ? red : amber;
            const winPct  = tour.totalGames > 0 ? tour.wins  / tour.totalGames * 100 : 0;
            const lossPct = tour.totalGames > 0 ? tour.losses / tour.totalGames * 100 : 0;
            const drawPct = tour.totalGames > 0 ? tour.draws  / tour.totalGames * 100 : 0;
            return (
              <div key={tour.name}>
                {/* Panel header — clickable */}
                <div
                  onClick={() => setExpanded(isOpen ? null : tour.name)}
                  style={{ padding: "10px 12px", borderRadius: isOpen ? "11px 11px 0 0" : 11, background: "hsl(var(--muted)/0.28)", border: `1px solid ${accentColor}44`, borderLeft: `3px solid ${accentColor}`, cursor: "pointer", userSelect: "none" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tour.name}</div>
                      <div style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                        {tour.totalGames} her · {tour.wins}W / {tour.losses}L{tour.draws > 0 ? ` / ${tour.draws}D` : ""}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-mono)", color: accentColor, lineHeight: 1 }}>
                          {tour.totalDelta >= 0 ? "+" : ""}{tour.totalDelta}
                        </div>
                        <div style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>
                          avg {tour.avgDelta >= 0 ? "+" : ""}{tour.avgDelta}
                        </div>
                      </div>
                      <ChevronDown size={14} style={{ color: "hsl(var(--muted-foreground))", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                    </div>
                  </div>
                  <div style={{ marginTop: 7, height: 3, borderRadius: 99, background: "hsl(var(--muted))", overflow: "hidden", display: "flex", gap: 1 }}>
                    <div style={{ flex: winPct,  background: green, minWidth: winPct  > 0 ? 2 : 0 }} />
                    <div style={{ flex: drawPct, background: "hsl(var(--muted-foreground)/0.35)", minWidth: drawPct > 0 ? 2 : 0 }} />
                    <div style={{ flex: lossPct, background: red,   minWidth: lossPct > 0 ? 2 : 0 }} />
                  </div>
                </div>

                {/* Expandable game list */}
                {isOpen && (
                  <div style={{ border: `1px solid ${accentColor}44`, borderLeft: `3px solid ${accentColor}`, borderTop: "none", borderRadius: "0 0 11px 11px", overflow: "hidden" }}>
                    {/* Column headers */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 72px 52px 56px", padding: "5px 12px", borderBottom: "1px solid hsl(var(--border)/0.3)", fontSize: 8, fontFamily: "var(--font-mono)", fontWeight: 700, color: "hsl(var(--muted-foreground))", letterSpacing: "0.08em", textTransform: "uppercase" as const, background: "hsl(var(--muted)/0.12)" }}>
                      <span>Soupeř</span>
                      <span style={{ textAlign: "right" }}>ELO</span>
                      <span style={{ textAlign: "center" }}>Výsl.</span>
                      <span style={{ textAlign: "right" }}>Změna</span>
                    </div>
                    {tour.games.map((g, i) => {
                      const rc = g.result === "Won" ? green : g.result === "Lost" ? red : amber;
                      const rl = g.result === "Won" ? "V" : g.result === "Lost" ? "P" : "R";
                      return (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 72px 52px 56px", padding: "6px 12px", borderBottom: i < tour.games.length - 1 ? "1px solid hsl(var(--border)/0.45)" : "none", alignItems: "center", background: i % 2 === 0 ? "hsl(var(--muted)/0.1)" : "transparent" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.opponent}</span>
                          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", textAlign: "right" }}>{g.opponentElo || "—"}</span>
                          <span style={{ display: "flex", justifyContent: "center" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: 6, background: `${rc}22`, border: `1px solid ${rc}55`, fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)", color: rc }}>{rl}</span>
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", color: rc, textAlign: "right" }}>{g.delta >= 0 ? "+" : ""}{g.delta}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── History Tab ──────────────────────────────────────────────────────────────
function HistoryTab({ data }: { data: PlayerDetailData }) {
  const { lang } = useAppNav();
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
          placeholder={t(lang, "pd_search_hist")}
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
              {r === "all" ? t(lang, "pd_filter_all") : r === "Won" ? t(lang, "pd_filter_won") : r === "Lost" ? t(lang, "pd_filter_lost") : t(lang, "pd_filter_draw")}
            </button>
          ))}
        </div>
        {/* Tournament type filter */}
        {tournaments.length > 0 && (
          <select value={filterTournament} onChange={e => handleFilter(() => setFilterTournament(e.target.value))}
            style={{ padding: "5px 8px", borderRadius: 8, border: "1px solid hsl(var(--border)/0.5)", background: "hsl(var(--muted)/0.4)", color: "hsl(var(--foreground))", fontSize: 11, fontFamily: "var(--font-mono)", cursor: "pointer" }}>
            <option value="all">{t(lang, "pd_all_types")}</option>
            {tournaments.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
      </div>

      {/* ── Summary strip ── */}
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        {[
          { label: t(lang, "pd_total"), value: filtered.length, color: "hsl(var(--foreground))" },
          { label: t(lang, "pd_wins_label"), value: wins, color: green },
          { label: t(lang, "pd_losses_label"), value: losses, color: red },
          { label: t(lang, "pd_draws_label"), value: draws, color: amber },
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
          {[t(lang,"pd_hist_date"), t(lang,"pd_hist_opp"), t(lang,"pd_hist_tour"), t(lang,"pd_hist_elo_before"), t(lang,"pd_hist_elo_after"), t(lang,"pd_hist_change"), t(lang,"pd_hist_result")].map(h => (
            <div key={h} className="history-cell" style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: muted, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</div>
          ))}
        </div>
        {/* Rows */}
        <div style={{ flex: 1, overflowY: "auto" }} className="scrollbar-thin">
          {pageData.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: muted, fontFamily: "var(--font-mono)", fontSize: 12 }}>{t(lang, "pd_no_matches")}</div>
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
              {page + 1} / {totalPages} · {filtered.length} {t(lang, "pd_matches")}
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
  const { selectedPlayer, playerSubView, lang } = useAppNav();
  const { mode } = useRatingMode();
  const [data, setData] = useState<PlayerDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [communityRecords, setCommunityRecords] = useState<RecordsData | null>(null);
  const [superTagsMap, setSuperTagsMap] = useState<Record<string, SuperTag[]>>({});

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

  useEffect(() => {
    fetch("/api/player-tags").then(r => r.json()).then(setSuperTagsMap).catch(() => {});
  }, []);

  if (!selectedPlayer) return null;

  if (loading) return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
      {[1,2,3].map(i => <Skeleton key={i} h={i === 2 ? 180 : 90} />)}
      <style jsx global>{`@keyframes pd-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );

  if (error || !data) return (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 14, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))" }}>{t(lang, "pd_load_error")} {selectedPlayer.name}</div>
      <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground)/0.7)", fontFamily: "var(--font-mono)" }}>{t(lang, "pd_load_error2")}</div>
    </div>
  );

  return (
    <div style={{ height: "100%", overflow: "hidden" }}>
      {playerSubView === "overview"    && <OverviewTab    data={data} communityRecords={communityRecords} superTags={superTagsMap[selectedPlayer?.name ?? ""] ?? []} />}
      {playerSubView === "opponents"   && <OpponentsTab   data={data} />}
      {playerSubView === "tournaments" && <TournamentsTab data={data} />}
      {playerSubView === "history"     && <HistoryTab     data={data} />}
      <style jsx global>{`@keyframes pd-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}
