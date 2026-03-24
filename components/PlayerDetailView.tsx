"use client";

import { useEffect, useState } from "react";
import { useAppNav } from "./AppContext";
import { useRatingMode } from "./RatingModeProvider";
import { avatarInitials } from "@/lib/utils";
import { PlayerDetailData } from "@/lib/dataFetchers";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell,
} from "recharts";
import {
  TrendingUp, TrendingDown, Swords, Star, Award, Shield, Target,
  Zap, Activity, Calendar, Clock, Trophy, BarChart2, Users, Flame,
} from "lucide-react";

// ─── Glass card ───────────────────────────────────────────────────────────────
function GC({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", ...style }}>
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
function OverviewTab({ data }: { data: PlayerDetailData }) {
  const { selectedPlayer } = useAppNav();
  const { mode } = useRatingMode();
  const { summary: s, computed: c, eloTrend, rollingMomentum, deltaDistribution, weekdayPerf } = data;

  const fmt = (n: number) => n?.toLocaleString?.("cs-CZ") ?? "—";
  const fmtS = (n: number, d = 1) => (n >= 0 ? "+" : "") + n.toFixed(d);
  const green = "hsl(142,65%,50%)";
  const red = "hsl(0,65%,55%)";
  const amber = "hsl(42,80%,55%)";

  // Prepare ELO trend with period filter
  const [period, setPeriod] = useState<"30D"|"90D"|"180D"|"1Y"|"ALL">("ALL");
  const [trendMode, setTrendMode] = useState<"matchid"|"date">("matchid");
  const cutoffDays: Record<string, number> = { "30D": 30, "90D": 90, "180D": 180, "1Y": 365, "ALL": 99999 };
  const cutoff = new Date(Date.now() - cutoffDays[period] * 86400_000);

  // helper: parse Czech date dd.mm.yyyy → Date
  const parseCzDate = (s: string): Date | null => {
    const parts = s.split(".");
    if (parts.length === 3) return new Date(+parts[2], +parts[1]-1, +parts[0]);
    return null;
  };

  // Match ID mode — every game row, sorted oldest→newest
  const filteredTrend = eloTrend
    .filter(p => {
      if (period === "ALL") return true;
      const d = parseCzDate(p.date);
      return d ? d >= cutoff : true;
    })
    .sort((a, b) => {
      const da = parseCzDate(a.date), db = parseCzDate(b.date);
      if (!da || !db) return 0;
      return da.getTime() - db.getTime(); // oldest first
    });

  // Date mode — last game ELO per day, sorted oldest→newest
  const filteredTrendByDate = (data.eloTrendByDate ?? [])
    .filter(p => {
      if (period === "ALL") return true;
      const d = parseCzDate(p.date);
      return d ? d >= cutoff : true;
    })
    .sort((a, b) => {
      const da = parseCzDate(a.date), db = parseCzDate(b.date);
      if (!da || !db) return 0;
      return da.getTime() - db.getTime(); // oldest first
    });

  const activeTrend = trendMode === "matchid" ? filteredTrend : filteredTrendByDate;

  // Compute domain with +100 buffer so peaks/valleys breathe
  const trendElos = activeTrend.map((p: any) => p.elo).filter((v: any) => typeof v === "number");
  const trendMin = trendElos.length ? Math.min(...trendElos) - 100 : "auto";
  const trendMax = trendElos.length ? Math.max(...trendElos) + 100 : "auto";

  const streakColor = c.currentStreak.type === "win" ? green : c.currentStreak.type === "lose" ? red : "hsl(var(--muted-foreground))";
  const streakLabel = c.currentStreak.type === "win" ? "🔥 Win streak" : c.currentStreak.type === "lose" ? "💀 Lose streak" : "Streak";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, height: "100%", overflowY: "auto" }} className="scrollbar-thin">

      {/* ── Row 1: Hero + základní bloky ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 1fr 1fr", gap: 10, flexShrink: 0 }}>
        {/* Hero */}
        <GC>
          <div style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.25)", boxShadow: "0 0 20px -4px hsl(var(--primary) / 0.3)", flexShrink: 0, fontFamily: "var(--font-display)" }}>
                {avatarInitials(s.name)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, fontFamily: "var(--font-display)", lineHeight: 1.2 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", marginTop: 2 }}>Rank #{selectedPlayer?.id} · {mode}</div>
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "var(--font-mono)", color: "hsl(var(--primary))", lineHeight: 1 }}>{fmt(s.currentElo)}</div>
            <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", marginTop: 2 }}>ELO</div>
            <div style={{ display: "flex", gap: 14, marginTop: 10, paddingTop: 10, borderTop: "1px solid hsl(var(--border)/0.4)" }}>
              <div><div style={{ fontSize: 15, fontWeight: 600, color: green, fontFamily: "var(--font-mono)" }}>{s.wins}</div><div style={{ fontSize: 9, color: "hsl(var(--muted-foreground))" }}>WIN</div></div>
              <div><div style={{ fontSize: 15, fontWeight: 600, color: red, fontFamily: "var(--font-mono)" }}>{s.losses}</div><div style={{ fontSize: 9, color: "hsl(var(--muted-foreground))" }}>LOSS</div></div>
              <div><div style={{ fontSize: 15, fontWeight: 600, fontFamily: "var(--font-mono)" }}>{s.draws}</div><div style={{ fontSize: 9, color: "hsl(var(--muted-foreground))" }}>DRAW</div></div>
              <div><div style={{ fontSize: 15, fontWeight: 600, color: amber, fontFamily: "var(--font-mono)" }}>{(s.winrate * 100).toFixed(0)}%</div><div style={{ fontSize: 9, color: "hsl(var(--muted-foreground))" }}>WR</div></div>
            </div>
          </div>
        </GC>

        {/* ELO blok */}
        <GC>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            <SH>ELO přehled</SH>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <KV label="Peak ELO" value={fmt(s.peakElo)} color={amber} />
              <KV label="Min ELO" value={fmt(s.minElo)} color={red} />
              <KV label="ELO Range" value={fmt(c.eloRange)} />
              <KV label="Peak Retention" value={`${c.peakRetention}%`} color={c.peakRetention >= 90 ? green : amber} />
              <KV label="Dní od peak" value={s.daysSincePeak > 0 ? `${s.daysSincePeak}d` : "Aktuální peak"} color={s.daysSincePeak <= 7 ? green : "hsl(var(--foreground))"} />
              <KV label="Bayesian WR" value={s.bayesianWR ?? "—"} color="hsl(var(--primary))" />
            </div>
            <div style={{ marginTop: 2 }}>
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", marginBottom: 4 }}>Peak retention</div>
              <div style={{ height: 5, borderRadius: 99, background: "hsl(var(--muted))" }}>
                <div style={{ height: "100%", width: `${c.peakRetention}%`, background: c.peakRetention >= 90 ? green : amber, borderRadius: 99 }} />
              </div>
            </div>
            <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", marginTop: 2 }}>Poslední zápas: {s.lastMatch}</div>
          </div>
        </GC>

        {/* Aktivita */}
        <GC>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            <SH>Aktivita</SH>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <KV label="Hry celkem" value={fmt(s.totalGames)} />
              <KV label="Avg ELO soupeřů" value={fmt(s.avgOppElo)} />
              <KV label="Hry (7 dní)" value={fmt(c.games7d)} />
              <KV label="Hry (30 dní)" value={fmt(c.games30d)} />
              <KV label="Δ 7 dní" value={(c.eloChange7d >= 0 ? "+" : "") + fmt(c.eloChange7d)} color={c.eloChange7d >= 0 ? green : red} />
              <KV label="Δ 30 dní" value={(c.eloChange30d >= 0 ? "+" : "") + fmt(c.eloChange30d)} color={c.eloChange30d >= 0 ? green : red} />
            </div>
            <div style={{ paddingTop: 8, borderTop: "1px solid hsl(var(--border)/0.3)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <KV label="Δ tento týden" value={(c.eloChangeThisWeek >= 0 ? "+" : "") + fmt(c.eloChangeThisWeek)} color={c.eloChangeThisWeek >= 0 ? green : red} size="sm" />
              <KV label="Δ minulý týden" value={(c.eloChangeLastWeek >= 0 ? "+" : "") + fmt(c.eloChangeLastWeek)} color={c.eloChangeLastWeek >= 0 ? green : red} size="sm" />
              <KV label="Her/aktivní den" value={String(c.avgGamesPerActiveDay)} size="sm" />
              <KV label="Nejaktivnější den" value={c.bestDayOfWeek ?? "—"} size="sm" />
              <KV label="Avg pauza (dny)" value={c.avgGapBetweenGames > 0 ? `${c.avgGapBetweenGames}d` : "—"} size="sm" />
              <KV label="Nejdelší pauza" value={c.longestPause > 0 ? `${c.longestPause}d` : "—"} size="sm" />
            </div>
          </div>
        </GC>

        {/* ELO změny + streak */}
        <GC>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            <SH>ELO změny & streak</SH>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <KV label="Avg změna" value={fmtS(c.avgDelta)} color={c.avgDelta >= 0 ? green : red} />
              <KV label="Avg výhra" value={fmtS(c.avgWinDelta)} color={green} />
              <KV label="Avg prohra" value={fmtS(c.avgLossDelta)} color={red} />
              <KV label="EV / zápas" value={fmtS(c.ev)} color={c.ev >= 0 ? green : red} />
              <KV label="Max zisk" value={`+${fmt(c.biggestSingleGain)}`} color={green} />
              <KV label="Max ztráta" value={fmt(c.biggestSingleLoss)} color={red} />
            </div>
            <div style={{ paddingTop: 8, borderTop: "1px solid hsl(var(--border)/0.3)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <KV label="Perf. Rating" value={fmt(c.performanceRating)} color="hsl(var(--primary))" size="sm" />
              <KV label="Exp. Win Diff" value={fmtS(c.expectedWinDiff, 1)} color={c.expectedWinDiff >= 0 ? green : red} size="sm" />
              <KV label="ELO Efektivita" value={fmtS(c.eloEfficiencyRatio, 2)} color="hsl(var(--foreground))" size="sm" />
              <KV label="Ladder Rate/měs." value={fmtS(c.ladderClimbingRate, 1)} color={c.ladderClimbingRate >= 0 ? green : red} size="sm" />
              <KV label="ELO Ceiling est." value={`~${fmt(c.eloCeilingEstimate)}`} color={amber} size="sm" />
              <KV label="True Skill ±" value={`±${c.trueSkillSigma}`} color="hsl(var(--muted-foreground))" size="sm" />
            </div>
            <div style={{ marginTop: 4, padding: "8px 10px", borderRadius: 10, background: `${streakColor}18`, border: `1px solid ${streakColor}40` }}>
              <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{streakLabel}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: streakColor, fontFamily: "var(--font-mono)" }}>{c.currentStreak.length}×</div>
            </div>
          </div>
        </GC>
      </div>

      {/* ── Row 2: ELO trend (main) ─── */}
      <GC style={{ flexShrink: 0 }}>
        <div style={{ padding: "14px 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)" }}>Vývoj ELO v čase</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {/* Match ID / Datum toggle */}
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
            {/* Period filter */}
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
              <XAxis dataKey="date" tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} interval="preserveStartEnd" />
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
                    {trendMode === "date" && <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", marginTop: 2 }}>ELO na konci dne</div>}
                  </div>
                );
              }} />
              <Area type="monotone" dataKey="elo" name="ELO" stroke="hsl(var(--primary))" fill="url(#pdElo)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GC>

      {/* ── Row 3: Pokročilé indexy + Delta hist + Weekday ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, flexShrink: 0 }}>
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
              <KV label="Upset Rate" value={`${c.upsetRate}%`} color="hsl(var(--foreground))" size="sm" />
              <KV label="Choking Index" value={`${c.chokingIndex}%`} color={c.chokingIndex >= 30 ? red : amber} size="sm" />
              <KV label="Hot Hand" value={fmtS(c.hotHandEffect, 2)} color={c.hotHandEffect > 0.15 ? green : "hsl(var(--foreground))"} size="sm" />
              <KV label="Fatigue Index" value={`${c.fatigueIndex > 0 ? "+" : ""}${c.fatigueIndex}%`} color={c.fatigueIndex > 10 ? red : "hsl(var(--foreground))"} size="sm" />
              <KV label="OQA Winrate" value={`${c.oqaWR}%`} color="hsl(var(--primary))" size="sm" />
              <KV label="Nejlepší měsíc" value={c.bestMonth ?? "—"} size="sm" />
              <KV label="Zisk best měs." value={c.bestMonthGain > 0 ? `+${fmt(c.bestMonthGain)}` : "—"} color={green} size="sm" />
              <KV label="Nejhorší měsíc" value={c.worstMonth ?? "—"} size="sm" />
              <KV label="Ztráta worst měs." value={c.worstMonthLoss < 0 ? fmt(c.worstMonthLoss) : "—"} color={red} size="sm" />
            </div>
          </div>
        </GC>

        {/* Delta distribuce */}
        <GC>
          <div style={{ padding: "14px 16px 0", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)" }}>Distribuce ELO změn</div>
          <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", padding: "0 16px 0" }}>Zelená = zisk, červená = ztráta</div>
          <div style={{ height: 180, padding: "8px 4px 8px 8px" }}>
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

        {/* Výkon dle dne v týdnu */}
        <GC>
          <div style={{ padding: "14px 16px 0", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)" }}>Výkon dle dne</div>
          <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", padding: "0 16px 4px" }}>Winrate a počet her per den v týdnu</div>
          <div style={{ height: 180, padding: "4px 4px 8px 8px" }}>
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
      </div>

      {/* ── Row 4: Rolling Momentum + winrate vs opp ELO + soupeřský blok ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 280px", gap: 10, flexShrink: 0, paddingBottom: 16 }}>
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
                <ReferenceLine x={String(Math.floor(s.currentElo / 50) * 50)} stroke={amber} strokeDasharray="3 2" label={{ value: "Ty", fontSize: 9, fill: amber }} />
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

        {/* Soupeřský blok — summary */}
        <GC>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            <SH>Soupeřský blok</SH>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: "WR vs. slabší (−100)", value: `${c.winVsWeaker}%`, color: c.winVsWeaker >= 60 ? green : amber },
                { label: "WR vs. podobní (±100)", value: `${c.winVsSimilar}%`, color: c.winVsSimilar >= 50 ? green : red },
                { label: "WR vs. silnější (+100)", value: `${c.winVsStronger}%`, color: c.winVsStronger >= 40 ? green : red },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{r.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-mono)", color: r.color }}>{r.value}</div>
                </div>
              ))}
            </div>
            <div style={{ paddingTop: 8, borderTop: "1px solid hsl(var(--border)/0.3)", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <div>
                  <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>Největší poražené ELO</div>
                  <div style={{ fontSize: 16, fontWeight: 600, fontFamily: "var(--font-mono)", color: green }}>{c.biggestUpset > 0 ? c.biggestUpset.toLocaleString("cs-CZ") : "—"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>Nejsil. ELO co tě porazilo</div>
                  <div style={{ fontSize: 16, fontWeight: 600, fontFamily: "var(--font-mono)", color: red }}>{c.hardestLoss > 0 ? c.hardestLoss.toLocaleString("cs-CZ") : "—"}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <div>
                  <div style={{ fontSize: 9, color: red, fontFamily: "var(--font-mono)", marginBottom: 1 }}>💀 Nemesis</div>
                  <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "var(--font-display)" }}>{c.nemesis ?? "—"}</div>
                  {c.nemesis && c.nemesis !== "—" && <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>WR: {c.nemesisWR}%</div>}
                </div>
                <div>
                  <div style={{ fontSize: 9, color: green, fontFamily: "var(--font-mono)", marginBottom: 1 }}>🏆 Prey</div>
                  <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "var(--font-display)" }}>{c.prey ?? "—"}</div>
                  {c.prey && c.prey !== "—" && <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>WR: {c.preyWR}%</div>}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>Upset Factor (avg ELO rozdíl)</div>
                <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-mono)", color: amber }}>+{c.upsetFactor}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>Nejčastější soupeř</div>
                <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)" }}>{c.mostPlayedOpponent.name}</div>
                <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{c.mostPlayedOpponent.games} her · {c.mostPlayedOpponent.winrate}% WR</div>
              </div>
            </div>
          </div>
        </GC>
      </div>
      {/* ── Row 5: Streak blok + ELO Brackets ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flexShrink: 0, paddingBottom: 16 }}>
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
            </div>
          </div>
        </GC>

        {/* ELO Brackets winrate */}
        <GC>
          <div style={{ padding: "14px 16px 0", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)" }}>WR dle ELO pásma soupeře</div>
          <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", padding: "2px 16px 0" }}>Winrate v závislosti na síle soupeře</div>
          <div style={{ flex: 1, padding: "10px 16px 16px" }}>
            {(c.eloBrackets ?? []).map((b, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "hsl(var(--foreground))", fontWeight: 500 }}>{b.bracket}</div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{b.games} her</span>
                    <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", color: b.games === 0 ? "hsl(var(--muted-foreground))" : b.winrate >= 55 ? green : b.winrate >= 45 ? amber : red }}>{b.games > 0 ? `${b.winrate}%` : "—"}</span>
                    {b.games > 0 && <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: b.avgDelta >= 0 ? green : red }}>{b.avgDelta >= 0 ? "+" : ""}{b.avgDelta}</span>}
                  </div>
                </div>
                <div style={{ height: 5, borderRadius: 99, background: "hsl(var(--muted))", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${b.games > 0 ? b.winrate : 0}%`, background: b.games === 0 ? "hsl(var(--muted))" : b.winrate >= 55 ? green : b.winrate >= 45 ? amber : red, borderRadius: 99, transition: "width 0.5s ease" }} />
                </div>
              </div>
            ))}
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
  const [search, setSearch] = useState("");
  const filtered = search.trim()
    ? opponents.filter(o => o.name.toLowerCase().includes(search.toLowerCase()))
    : opponents;
  const top10 = filtered.slice(0, 50);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, height: "100%" }}>
      {/* Table */}
      <GC style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "14px 16px 10px", flexShrink: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, fontFamily: "var(--font-display)" }}>H2H přehled — Top soupeři</div>
          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            {[
              { l: "Nejlepší bilance", n: c.bestOpponent.name, v: `${c.bestOpponent.winrate}%`, c: green },
              { l: "Nejhorší bilance", n: c.worstOpponent.name, v: `${c.worstOpponent.winrate}%`, c: red },
            ].map(r => (
              <div key={r.l} style={{ flex: 1, padding: "8px 10px", borderRadius: 10, background: `${r.c}15`, border: `1px solid ${r.c}30` }}>
                <div style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{r.l}</div>
                <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "var(--font-display)", marginTop: 1 }}>{r.n}</div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-mono)", color: r.c }}>{r.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: "0 16px 8px", flexShrink: 0 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Hledat soupeře…"
            style={{ width: "100%", padding: "5px 10px", borderRadius: 8, border: "1px solid hsl(var(--border)/0.5)", background: "hsl(var(--muted)/0.4)", color: "hsl(var(--foreground))", fontSize: 11, fontFamily: "var(--font-mono)", outline: "none" }}
          />
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px" }} className="scrollbar-thin">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid hsl(var(--border)/0.5)" }}>
                {["Soupeř", "Hry", "W", "L", "D", "WR%", "Avg Δ", "Naposledy"].map(h => (
                  <th key={h} style={{ padding: "6px 4px", textAlign: "left", fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {top10.map((o, i) => (
                <tr key={i} style={{ borderBottom: "1px solid hsl(var(--border)/0.25)", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--muted)/0.4)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "8px 4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, background: "hsl(var(--primary)/0.12)", color: "hsl(var(--primary))", fontFamily: "var(--font-mono)", flexShrink: 0 }}>{avatarInitials(o.name)}</div>
                      <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "var(--font-display)", whiteSpace: "nowrap" }}>{o.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "8px 4px", fontSize: 12, fontFamily: "var(--font-mono)" }}>{o.games}</td>
                  <td style={{ padding: "8px 4px", fontSize: 12, fontFamily: "var(--font-mono)", color: green, fontWeight: 600 }}>{o.wins}</td>
                  <td style={{ padding: "8px 4px", fontSize: 12, fontFamily: "var(--font-mono)", color: red, fontWeight: 600 }}>{o.losses}</td>
                  <td style={{ padding: "8px 4px", fontSize: 12, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))" }}>{o.draws}</td>
                  <td style={{ padding: "8px 4px", fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 700, color: o.winrate >= 50 ? green : red }}>{o.winrate}%</td>
                  <td style={{ padding: "8px 4px", fontSize: 12, fontFamily: "var(--font-mono)", color: o.avgDelta >= 0 ? green : red }}>{o.avgDelta >= 0 ? "+" : ""}{o.avgDelta}</td>
                  <td style={{ padding: "8px 4px", fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", whiteSpace: "nowrap" }}>{o.lastDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GC>

      {/* Chart */}
      <GC style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 16px 0", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-display)" }}>Winrate vs. soupeři</div>
        <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", padding: "2px 16px 0" }}>Top soupeři — zelená &gt;50%, červená &lt;50%</div>
        <div style={{ flex: 1, padding: "8px 8px 16px 4px", minHeight: 0 }}>
          <ResponsiveContainer width="100%" height={Math.max(200, Math.min(top10.length, 15) * 28)}>
            <BarChart layout="vertical" data={[...top10.slice(0, 15)].reverse()} margin={{ top: 0, right: 48, bottom: 0, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border)/0.3)" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fontFamily: "var(--font-display)", fontWeight: 600 }} width={90} />
              <ReferenceLine x={50} stroke="hsl(var(--border))" strokeDasharray="4 2" />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return (
                  <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{d.name}</div>
                    <div style={{ color: d.winrate >= 50 ? green : red }}>WR: {d.winrate}%</div>
                    <div style={{ color: "hsl(var(--muted-foreground))" }}>Hry: {d.games}</div>
                  </div>
                );
              }} />
              <Bar dataKey="winrate" name="Winrate %" radius={[0, 4, 4, 0]}>
                {[...top10.slice(0, 15)].reverse().map((d, i) => <Cell key={i} fill={d.winrate >= 50 ? green : red} fillOpacity={0.82} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GC>
    </div>
  );
}

// ─── Tournaments Tab ──────────────────────────────────────────────────────────
function TournamentsTab({ data }: { data: PlayerDetailData }) {
  const { tournamentPerf, streaks } = data;
  const green = "hsl(142,65%,50%)";
  const red = "hsl(0,65%,55%)";
  const amber = "hsl(42,80%,55%)";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, height: "100%" }}>
      {/* Left: tournament perf table */}
      <GC style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "14px 16px 10px", flexShrink: 0, fontSize: 14, fontWeight: 600, fontFamily: "var(--font-display)" }}>ELO výkon per turnaj</div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px" }} className="scrollbar-thin">
          {tournamentPerf.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", fontSize: 12 }}>Žádná turnajová data</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {tournamentPerf.map((t, i) => (
                <div key={i} style={{ padding: "10px 12px", borderRadius: 10, background: "hsl(var(--muted)/0.3)", border: "1px solid hsl(var(--border)/0.4)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)" }}>{t.name}</div>
                      <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                        {t.games} her · {t.wins}W / {t.losses}L
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-mono)", color: t.totalDelta >= 0 ? green : red }}>
                        {t.totalDelta >= 0 ? "+" : ""}{t.totalDelta}
                      </div>
                      <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>
                        avg {t.avgDelta >= 0 ? "+" : ""}{t.avgDelta}/zápas
                      </div>
                    </div>
                  </div>
                  {/* Mini progress bar */}
                  <div style={{ marginTop: 8, height: 4, borderRadius: 99, background: "hsl(var(--muted))", overflow: "hidden", display: "flex" }}>
                    <div style={{ width: `${t.games > 0 ? (t.wins / t.games * 100) : 0}%`, background: green }} />
                    <div style={{ width: `${t.games > 0 ? (t.losses / t.games * 100) : 0}%`, background: red }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </GC>

      {/* Right: tournament avg delta chart + streaks */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <GC style={{ flex: 1 }}>
          <div style={{ padding: "14px 16px 0", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-display)" }}>Průměrná Δ ELO per turnaj</div>
          <div style={{ height: "calc(100% - 44px)", padding: "8px 4px 8px 8px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tournamentPerf.slice(0, 12)} margin={{ top: 4, right: 8, bottom: 40, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.3)" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} angle={-35} textAnchor="end" height={44} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} width={32} />
                <ReferenceLine y={0} stroke="hsl(var(--border))" />
                <Tooltip content={<CT />} />
                <Bar dataKey="avgDelta" name="Avg Δ ELO" radius={[3, 3, 0, 0]}>
                  {tournamentPerf.slice(0, 12).map((d, i) => <Cell key={i} fill={d.avgDelta >= 0 ? green : red} fillOpacity={0.85} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GC>

        {/* Streaks panel */}
        <GC>
          <div style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)", marginBottom: 10 }}>Streak timeline</div>
            {streaks.length === 0 ? (
              <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>Žádné streaks (min. 2 za sebou)</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 180, overflowY: "auto" }} className="scrollbar-thin">
                {[...streaks].reverse().slice(0, 12).map((s, i) => {
                  const color = s.type === "win" ? green : s.type === "lose" ? red : "hsl(var(--muted-foreground))";
                  const label = s.type === "win" ? "🔥 Win" : s.type === "lose" ? "💀 Lose" : "➖ Draw";
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 60, fontSize: 10, fontFamily: "var(--font-mono)", color, fontWeight: 600, flexShrink: 0 }}>{label} ×{s.length}</div>
                      <div style={{ flex: 1, height: 6, borderRadius: 99, background: "hsl(var(--muted))", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min(s.length * 8, 100)}%`, background: color, opacity: 0.7, borderRadius: 99 }} />
                      </div>
                      <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", flexShrink: 0, width: 64, textAlign: "right" }}>{s.startDate}</div>
                    </div>
                  );
                })}
              </div>
            )}
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
        <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 130px 90px 90px 80px 70px", gap: 0, padding: "8px 14px", borderBottom: "1px solid hsl(var(--border)/0.4)", flexShrink: 0 }}>
          {["Datum", "Soupeř", "Turnaj", "ELO před", "ELO po", "Změna", "Výsledek"].map(h => (
            <div key={h} style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: muted, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</div>
          ))}
        </div>
        {/* Rows */}
        <div style={{ flex: 1, overflowY: "auto" }} className="scrollbar-thin">
          {pageData.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: muted, fontFamily: "var(--font-mono)", fontSize: 12 }}>Žádné zápasy neodpovídají filtru</div>
          ) : pageData.map((m, i) => (
            <div key={`${m.matchId}-${i}`}
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

  useEffect(() => {
    if (!selectedPlayer) return;
    setLoading(true); setError(false); setData(null);
    fetch(`/api/player-detail?mode=${mode}&name=${encodeURIComponent(selectedPlayer.name)}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
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
      {playerSubView === "overview"    && <OverviewTab    data={data} />}
      {playerSubView === "opponents"   && <OpponentsTab   data={data} />}
      {playerSubView === "tournaments" && <TournamentsTab data={data} />}
      {playerSubView === "history"     && <HistoryTab     data={data} />}
      <style jsx global>{`@keyframes pd-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}
