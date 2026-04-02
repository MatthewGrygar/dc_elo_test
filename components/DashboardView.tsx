"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useRatingMode } from "./RatingModeProvider";
import { useAppNav } from "./AppContext";
import { DashboardData, Player } from "@/lib/sheets";
import type { MatchGroup } from "@/app/api/dashboard/route";
import { mockEloDistribution } from "@/lib/mockData";
import { avatarInitials } from "@/lib/utils";
import { t } from "@/lib/i18n";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  Swords, Users, Trophy, ArrowRight, Activity,
  ChevronLeft, ChevronRight, Zap, Clock, TrendingUp,
} from "lucide-react";
import type { PrefetchCache } from "@/app/page";
import { useWinSize } from "@/hooks/useWinSize";

// ── Helpers ──────────────────────────────────────────────────────────────────
function buildDist(players: Player[]) {
  if (!players.length) return mockEloDistribution;
  const bins: Record<number, number> = {};
  for (const p of players) {
    const low = Math.floor(p.rating / 50) * 50;
    bins[low] = (bins[low] || 0) + 1;
  }
  return Object.keys(bins).map(Number).sort((a, b) => a - b)
    .map(low => ({ range: `${low}`, label: `${low}–${low + 50}`, count: bins[low] }));
}

const VT_META = {
  VT1: { label: "Class A", color: "hsl(152,72%,45%)", bg: "hsl(152 72% 45% / .12)", border: "hsl(152 72% 45% / .3)" },
  VT2: { label: "Class B", color: "hsl(42,92%,52%)",  bg: "hsl(42 92% 52% / .12)",  border: "hsl(42 92% 52% / .3)"  },
  VT3: { label: "Class C", color: "hsl(24,88%,56%)",  bg: "hsl(24 88% 56% / .12)",  border: "hsl(24 88% 56% / .3)"  },
  VT4: { label: "Class D", color: "hsl(0,70%,58%)",   bg: "hsl(0 70% 58% / .12)",   border: "hsl(0 70% 58% / .3)"   },
} as const;

function VtBadge({ vt }: { vt?: keyof typeof VT_META }) {
  if (!vt || !VT_META[vt]) return null;
  const m = VT_META[vt];
  return <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: m.bg, color: m.color, border: `1px solid ${m.border}`, fontFamily: "var(--font-mono)", letterSpacing: "0.04em", flexShrink: 0 }}>{m.label}</span>;
}

// ── Glass Panel ───────────────────────────────────────────────────────────────
function Panel({ children, style, accent }: { children: React.ReactNode; style?: React.CSSProperties; accent?: boolean }) {
  return (
    <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", ...style }}>
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        background: "hsl(var(--card) / 0.80)",
        backdropFilter: "blur(16px) saturate(150%)", WebkitBackdropFilter: "blur(16px) saturate(150%)",
        border: `1px solid ${accent ? "hsl(var(--primary) / 0.30)" : "hsl(var(--card-border) / 0.85)"}`,
        borderRadius: 16,
      }} />
      {accent && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, zIndex: 2, background: "linear-gradient(90deg, hsl(var(--primary)), transparent 70%)" }} />}
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>{children}</div>
    </div>
  );
}

// ── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, accent }: {
  icon: React.ElementType; label: string; value: string; sub?: string; accent?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        position: "relative", borderRadius: 14, overflow: "hidden", cursor: "default",
        transition: "transform 0.18s", transform: hov ? "translateY(-2px)" : "none",
      }}
    >
      <div style={{
        position: "absolute", inset: 0,
        background: "hsl(var(--card) / 0.82)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        border: `1px solid ${accent ? "hsl(var(--primary) / 0.32)" : "hsl(var(--card-border) / 0.85)"}`,
        borderRadius: 14,
      }} />
      {accent && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, hsl(var(--primary)), transparent)" }} />}
      <div style={{ position: "relative", zIndex: 1, padding: "11px 14px", display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{label}</span>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: accent ? "hsl(var(--primary) / 0.16)" : "hsl(var(--muted) / 0.7)", display: "flex", alignItems: "center", justifyContent: "center", color: accent ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}>
            <Icon size={11} />
          </div>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, letterSpacing: "-0.04em", color: accent ? "hsl(var(--primary))" : "hsl(var(--foreground))", lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))" }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
function CT({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 9, padding: "6px 10px", fontFamily: "var(--font-mono)", fontSize: 11 }}>
      {label && <div style={{ color: "hsl(var(--muted-foreground))", marginBottom: 2 }}>{label}</div>}
      {payload.map((p: any, i: number) => <div key={i} style={{ color: p.color ?? "hsl(var(--primary))", fontWeight: 600 }}>{typeof p.value === "number" ? p.value.toLocaleString("cs-CZ") : p.value}</div>)}
    </div>
  );
}

// ── Hero Slider ───────────────────────────────────────────────────────────────
function HeroSlider({ onNavigate }: { onNavigate: (view: any) => void }) {
  const { setSupportOpen, lang } = useAppNav();
  const { wBp } = useWinSize();
  const slides = [
    { slide: "/slide1.png", headline: t(lang, "slide1_title"), tag: t(lang, "slide1_tag"), text: t(lang, "slide1_desc"), cta: t(lang, "slide1_btn"), action: "organization" as const, accent: "hsl(195,78%,50%)" },
    { slide: "/slide2.png", headline: t(lang, "slide2_title"), tag: t(lang, "slide2_tag"), text: t(lang, "slide2_desc"), cta: t(lang, "slide2_btn"), action: "articles" as const, accent: "hsl(152,72%,50%)" },
    { slide: "/slide3.png", headline: t(lang, "slide3_title"), tag: t(lang, "slide3_tag"), text: t(lang, "slide3_desc"), cta: t(lang, "slide3_btn"), action: "support" as const, accent: "hsl(42,80%,52%)" },
  ];
  const isCompact = wBp === "xs" || wBp === "sm";
  const [current, setCurrent] = useState(0);
  const [anim, setAnim] = useState(false);
  const [progKey, setProgKey] = useState(0);
  const slide = slides[current];

  useEffect(() => {
    const timer = setInterval(() => {
      setAnim(true);
      setProgKey(k => k + 1);
      setTimeout(() => { setCurrent(c => (c + 1) % slides.length); setAnim(false); }, 320);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goTo = (i: number) => {
    if (i === current) return;
    setAnim(true);
    setProgKey(k => k + 1);
    setTimeout(() => { setCurrent(i); setAnim(false); }, 320);
  };


  return (
    <div className="hero-slider" style={{ position: "relative", borderRadius: 16, overflow: "hidden", height: isCompact ? 200 : "100%", border: "1px solid hsl(var(--card-border)/0.6)" }}>
      <style>{`@keyframes slider-progress { from { width: 0% } to { width: 100% } }`}</style>

      {/* Full-bleed image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={slide.slide}
        src={slide.slide}
        alt=""
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center",
          opacity: anim ? 0 : 1, transition: "opacity 0.35s ease",
        }}
      />

      {/* Gradient overlays — bottom-heavy for text legibility */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, hsl(0 0% 0% / 0.82) 0%, hsl(0 0% 0% / 0.45) 45%, hsl(0 0% 0% / 0.12) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, hsl(0 0% 0% / 0.35) 0%, transparent 60%)" }} />

      {/* Nav arrows — top-right corner */}
      <div style={{ position: "absolute", top: 12, right: 12, zIndex: 10, display: "flex", gap: 4 }}>
        <button onClick={() => goTo((current - 1 + slides.length) % slides.length)}
          style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.85)", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,0.6)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.35)"; }}>
          <ChevronLeft size={14} />
        </button>
        <button onClick={() => goTo((current + 1) % slides.length)}
          style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.85)", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,0.6)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.35)"; }}>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Content — bottom-left overlay */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 5,
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        padding: isCompact ? "16px" : "22px 24px",
        opacity: anim ? 0 : 1, transition: "opacity 0.35s ease",
      }}>
        {/* Tag badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 5, alignSelf: "flex-start",
          padding: "3px 10px", borderRadius: 99, marginBottom: 10,
          background: `${slide.accent}30`, border: `1px solid ${slide.accent}60`,
          color: slide.accent, fontSize: 9, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.08em",
          backdropFilter: "blur(4px)",
        }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: slide.accent }} />
          {slide.tag}
        </div>

        {/* Headline */}
        <h2 style={{
          fontFamily: "var(--font-display)", fontWeight: 900,
          fontSize: isCompact ? 18 : 24,
          letterSpacing: "-0.03em", lineHeight: 1.1,
          color: "#fff", marginBottom: 8,
          maxWidth: isCompact ? "100%" : "60%",
          textShadow: "0 2px 12px rgba(0,0,0,0.4)",
        }}>
          {slide.headline}
        </h2>

        {/* Description */}
        {!isCompact && (
          <p style={{
            fontSize: 12, lineHeight: 1.65,
            color: "rgba(255,255,255,0.78)",
            maxWidth: "55%", marginBottom: 16,
            textShadow: "0 1px 6px rgba(0,0,0,0.5)",
          }}>
            {slide.text}
          </p>
        )}

        {/* CTA + dots row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button
            onClick={() => {
              if (slide.action === "support") setSupportOpen(true);
              else onNavigate(slide.action);
            }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "8px 18px", borderRadius: 10,
              background: slide.accent, color: "#fff",
              fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)",
              border: "none", cursor: "pointer",
              boxShadow: `0 4px 20px -4px ${slide.accent}90`,
            }}
          >
            {slide.cta} <ArrowRight size={12} />

          </button>

          {/* Dots */}
          <div style={{ display: "flex", gap: 6 }}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} style={{
                width: i === current ? 22 : 6, height: 6, borderRadius: 99,
                background: i === current ? slide.accent : "rgba(255,255,255,0.35)",
                border: "none", cursor: "pointer", padding: 0,
                transition: "all 0.3s ease",
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.12)", zIndex: 10 }}>
        <div key={progKey} style={{ height: "100%", background: slide.accent, borderRadius: 99, animation: "slider-progress 6s linear forwards" }} />
      </div>
    </div>
  );
}

// ── Milestone card ────────────────────────────────────────────────────────────
const MILESTONE_COLORS: Record<string, string> = {
  "Žebříček": "hsl(42,92%,52%)",
  "ELO":      "hsl(152,72%,50%)",
  "Class":    "hsl(195,78%,50%)",
  "Rekord":   "hsl(265,65%,60%)",
  "Série":    "hsl(0,72%,56%)",
  "Upset":    "hsl(24,88%,56%)",
};

const MILESTONE_BG: Record<string, string> = {
  "Žebříček": "hsl(42 92% 52% / .14)",
  "ELO":      "hsl(152 72% 50% / .14)",
  "Class":    "hsl(195 78% 50% / .14)",
  "Rekord":   "hsl(265 65% 60% / .14)",
  "Série":    "hsl(0 72% 56% / .14)",
  "Upset":    "hsl(24 88% 56% / .14)",
};

function MilestoneRow({ m, last }: { m: { icon: string; text: string; date: string; cat: string }; last?: boolean }) {
  const col = MILESTONE_COLORS[m.cat] ?? "hsl(var(--primary))";
  const bg  = MILESTONE_BG[m.cat]  ?? "hsl(var(--primary) / .14)";
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 14px",
      borderBottom: last ? "none" : "1px solid hsl(var(--border) / 0.35)",
    }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
        {m.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.4, color: "hsl(var(--foreground))", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.text}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
          <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: bg, color: col, fontFamily: "var(--font-mono)" }}>{m.cat}</span>
          <span style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{m.date}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DashboardView({ prefetchCache }: { prefetchCache?: PrefetchCache }) {
  const { mode } = useRatingMode();
  const { openPlayer, navigateTo, lang } = useAppNav();
  const { resolvedTheme } = useTheme();
  const { wBp } = useWinSize();
  const isDark = resolvedTheme === "dark";

  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [distMode, setDistMode] = useState<"ELO"|"DCPR">(mode);

  useEffect(() => {
    const c = prefetchCache?.[mode]?.dashboard;
    if (c) { setData(c); setLoading(false); return; }
    setLoading(true);
    fetch(`/api/dashboard?mode=${mode}`).then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [mode, prefetchCache]);

  const isCompact = wBp === "xs" || wBp === "sm";
  const isMid     = wBp === "md";
  const players   = data?.players ?? [];
  const stats     = data?.stats;
  const milestones = data?.milestones ?? [];
  const distPlayers = prefetchCache?.[distMode]?.players ?? players;
  const distData  = buildDist(distPlayers);
  const primaryCol = isDark ? "hsl(152,72%,50%)" : "hsl(152,65%,38%)";

  const matchGroups: MatchGroup[] = (data as any)?.matchGroups ?? [
    ...(data?.topMatchElo?.length ? [{ label: "Nejvyšší ELO", emoji: "⭐", matches: data.topMatchElo }] : []),
    ...(data?.topMatchDiff?.length ? [{ label: "Největší rozdíl ELO", emoji: "⚡", matches: data.topMatchDiff }] : []),
  ];
  const matchCards = matchGroups.flatMap((g) => g.matches.slice(0, 2));

  if (loading) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, flexShrink: 0 }}>
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 76, borderRadius: 14 }} />)}
        </div>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 10 }}>
          <div className="skeleton" style={{ borderRadius: 16 }} />
          <div className="skeleton" style={{ borderRadius: 16 }} />
        </div>
        <div style={{ height: 180, display: "grid", gridTemplateColumns: "1fr 1.4fr 1fr", gap: 10, flexShrink: 0 }}>
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ borderRadius: 16 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrap" style={{ height: "100%", display: "flex", flexDirection: "column", gap: 10, overflowY: isCompact ? "auto" : undefined }}>

      {/* ── Row 1: KPI strip ── */}
      <div
        className="anim-slide-up s1"
        style={{
          display: "grid",
          gridTemplateColumns: isCompact ? "repeat(2,1fr)" : "repeat(5,1fr)",
          gap: 8, flexShrink: 0,
        }}
      >
        <KpiCard icon={Swords}   label={t(lang, "dash_total_games")} value={(stats?.totalGames ?? 0).toLocaleString("cs-CZ")} sub={mode}  accent />
        <KpiCard icon={Users}    label={t(lang, "dash_players")}     value={(stats?.uniquePlayers ?? 0).toString()}          sub={t(lang, "dash_registered")} />
        <KpiCard icon={Activity} label={t(lang, "dash_median_elo")}  value={(stats?.medianElo ?? 0).toLocaleString("cs-CZ")} sub={t(lang, "dash_elo_center")} />
        <KpiCard icon={Trophy}   label={t(lang, "dash_tournaments")} value={(stats?.uniqueTournaments ?? 0).toString()}      sub={t(lang, "dash_total")} />
        <KpiCard icon={Clock}    label={t(lang, "dash_last_data")}   value={stats?.lastDataEntry ? stats.lastDataEntry.split(" ")[0] : "—"} sub={t(lang, "dash_newest_record")} />
      </div>

      {/* ── Row 2: Hero + matches ── */}
      <div
        className="anim-slide-up s2"
        style={{
          display: "grid",
          gridTemplateColumns: isCompact || isMid ? "1fr" : "1.55fr 1fr",
          gap: 10, height: isCompact ? "auto" : 280, flexShrink: 0,
        }}
      >
        {/* Hero slider */}
        <HeroSlider onNavigate={navigateTo} />

        {/* Interesting matches */}
        <Panel style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "12px 14px 10px", flexShrink: 0, borderBottom: "1px solid hsl(var(--border) / 0.5)" }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", marginBottom: 4 }}>
              {t(lang, "dash_interesting_matches")}
            </div>
          </div>
          <div style={{ overflowY: "auto", flex: 1, minHeight: 0, padding: "4px 0" }}>
            {matchCards.length === 0 ? (
              <div style={{ padding: "20px 14px", textAlign: "center", fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                {t(lang, "no_data")}
              </div>
            ) : (
              <>
                {matchGroups.map((group, gi) => (
                  <div key={gi}>
                    <div style={{ padding: "8px 14px 4px", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 11 }}>{group.emoji}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{group.label}</span>
                    </div>
                    {group.matches.slice(0, 2).map((m, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderBottom: "1px solid hsl(var(--border) / 0.3)" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--foreground))", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.player1}</span>
                        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: "hsl(var(--muted-foreground))", flexShrink: 0 }}>{m.elo1}</span>
                        <div style={{ display: "flex", gap: 3, flexShrink: 0, padding: "2px 7px", borderRadius: 6, background: "hsl(var(--muted) / 0.5)", fontSize: 10, fontWeight: 800, fontFamily: "var(--font-mono)" }}>
                          <span style={{ color: m.result1?.startsWith?.("Won") ? "hsl(142,65%,50%)" : m.result1?.startsWith?.("Draw") ? "hsl(42,80%,52%)" : "hsl(0,65%,55%)", fontWeight: 800 }}>
                            {m.result1?.startsWith?.("Won") ? "W" : m.result1?.startsWith?.("Draw") ? "D" : "L"}
                          </span>
                          {" — "}
                          <span style={{ color: m.result2?.startsWith?.("Won") ? "hsl(142,65%,50%)" : m.result2?.startsWith?.("Draw") ? "hsl(42,80%,52%)" : "hsl(0,65%,55%)", fontWeight: 800 }}>
                            {m.result2?.startsWith?.("Won") ? "W" : m.result2?.startsWith?.("Draw") ? "D" : "L"}
                          </span>
                        </div>
                        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: "hsl(var(--muted-foreground))", flexShrink: 0 }}>{m.elo2}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--foreground))", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>{m.player2}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}
          </div>
        </Panel>
      </div>

      {/* ── Row 3: Milníky + ELO Distrib + Top hráči ── */}
      <div
        className="anim-slide-up s3"
        style={{
          display: "grid",
          gridTemplateColumns: isCompact ? "1fr" : isMid ? "1fr 1fr" : "1fr 1.4fr 1fr",
          gap: 10, flexShrink: 0,
          height: isCompact ? "auto" : 195, minHeight: isCompact ? undefined : 195,
        }}
      >
        {/* Milníky */}
        <Panel style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px 14px 8px", flexShrink: 0, borderBottom: "1px solid hsl(var(--border) / 0.5)" }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>
              {t(lang, "dash_milestones")}
            </div>
          </div>
          <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
            {milestones.length === 0 ? (
              <div style={{ padding: "16px 14px", textAlign: "center", fontSize: 11, color: "hsl(var(--muted-foreground))" }}>{t(lang, "dash_no_milestones")}</div>
            ) : milestones.slice(0, 4).map((m, i, arr) => (
              <MilestoneRow key={i} m={m} last={i === arr.length - 1} />
            ))}
          </div>
        </Panel>

        {/* ELO Distribution */}
        <Panel style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px 14px 8px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border) / 0.5)" }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>
              {t(lang, "dash_elo_dist")}
            </div>
            <div style={{ display: "flex", gap: 2 }}>
              {(["ELO", "DCPR"] as const).map(m => (
                <button key={m} onClick={() => setDistMode(m)}
                  style={{ padding: "2px 7px", borderRadius: 5, fontSize: 8, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.05em", border: "none", cursor: "pointer",
                    background: distMode === m ? "hsl(var(--primary))" : "hsl(var(--muted)/0.6)",
                    color: distMode === m ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))" }}>
                  {m}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>
              {(prefetchCache?.[distMode]?.players?.length ?? stats?.uniquePlayers ?? 0)} {t(lang, "dash_players_x50")}
            </span>
          </div>
          <div className="dist-chart" style={{ flex: 1, padding: "8px 10px 4px", minHeight: isCompact ? 140 : 0 }}>
            <ResponsiveContainer width="100%" height={isCompact ? 130 : "100%"}>
              <BarChart data={distData} barCategoryGap="4%" margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="range" tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }} tickLine={false} axisLine={false}
                  tickFormatter={(v) => v} interval={Math.ceil(distData.length / 6) - 1} />
                <YAxis hide />
                <Tooltip content={<CT />} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {distData.map((_, i) => (
                    <Cell key={i} fill={primaryCol} fillOpacity={0.42 + 0.58 * (i / distData.length)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Top hráči */}
        <Panel accent style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px 14px 8px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border) / 0.5)" }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>
              {t(lang, "dash_top_players")}
            </div>
            <button
              onClick={() => navigateTo("leaderboard")}
              style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9, fontWeight: 600, color: "hsl(var(--primary))", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)" }}
            >
              {t(lang, "dash_full_leaderboard")} <ArrowRight size={9} />
            </button>
          </div>
          <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
            {players.slice(0, 5).map((p, i) => {
              const medals = ["🥇", "🥈", "🥉"];
              const wr = p.winrate <= 1 ? p.winrate * 100 : p.winrate;
              return (
                <div
                  key={p.id}
                  onClick={() => openPlayer(p)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: i === 0 ? "10px 14px" : "7px 14px", borderBottom: i < 4 ? "1px solid hsl(var(--border) / 0.3)" : "none", cursor: "pointer", transition: "background .15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--primary) / 0.05)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  {i === 0 ? (
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: "hsl(var(--primary) / 0.20)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 700, color: "hsl(var(--primary))", fontFamily: "var(--font-display)",
                      }}>{avatarInitials(p.name)}</div>
                      <span style={{ position: "absolute", top: -4, right: -4, fontSize: 13 }}>👑</span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ fontSize: i < 3 ? 12 : 9, width: 14, textAlign: "center", color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                        {i < 3 ? medals[i] : i + 1}
                      </span>
                      <div style={{
                        width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                        background: "hsl(var(--muted) / 0.6)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 9, fontWeight: 700, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-display)",
                      }}>{avatarInitials(p.name)}</div>
                    </div>
                  )}
                  <span style={{ flex: 1, fontWeight: i === 0 ? 700 : 600, fontSize: i === 0 ? 13 : 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                  {(p as any).vtClass && <VtBadge vt={(p as any).vtClass} />}
                  <span style={{ fontSize: i === 0 ? 14 : 11, fontWeight: 700, fontFamily: "var(--font-mono)", color: "hsl(var(--primary))", flexShrink: 0 }}>
                    {p.rating.toLocaleString("cs-CZ")}
                  </span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}
