"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useRatingMode } from "./RatingModeProvider";
import { useAppNav } from "./AppContext";
import { DashboardData, Player } from "@/lib/sheets";
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
const SLIDES = [
  {
    tag: "🏆 Sezóna aktivní",
    headline: "JAK FUNGUJE VÝPOČET ELO?",
    subHeadline: "Aktuální žebříčky",
    text: "Vše o ELO a DCPR, proč kalibraci a jak fungují Rating Classy? To a mnohem víc se dozvíte v článku od tvůrce celého řešení.",
    cta: "Statistiky",
    person: { name: "Ervin Kuč", title: "Člen DCPR Komise,\nSpoluzakladatel Grail Series &" },
    slide: "/slide2.png",
    accent: "hsl(152,72%,50%)",
  },
  {
    tag: "⚡ Live data",
    headline: "REAL-TIME ŽEBŘÍČKY",
    subHeadline: "Živá data",
    text: "Tvůj rating se aktualizuje po každém zápase. Sleduj přesně kde stojíš v kompetitivní hierarchii Duel Commander scény.",
    cta: "Žebříček",
    person: { name: "Matthew Grygar", title: "Předseda DCPR Komise,\nSpoluzakladatel Grail Series &" },
    slide: "/slide1.png",
    accent: "hsl(195,78%,50%)",
  },
  {
    tag: "🎯 Turnajový režim",
    headline: "DCPR TOURNAMENT EDITION",
    subHeadline: "Výkonnostní rating",
    text: "DCPR sleduje tvůj turnajový výkon odděleně. Postupuj v kompetitivních řadách a získej své místo na vrcholu.",
    cta: "DCPR žebříček",
    person: null,
    slide: "/slide3.png",
    accent: "hsl(265,65%,60%)",
  },
];

function HeroSlider({ onNavigate }: { onNavigate: (view: any) => void }) {
  const { wBp } = useWinSize();
  const isCompact = wBp === "xs" || wBp === "sm";
  const [current, setCurrent] = useState(0);
  const [anim, setAnim] = useState(false);
  const [progKey, setProgKey] = useState(0);
  const slide = SLIDES[current];

  useEffect(() => {
    const t = setInterval(() => {
      setAnim(true);
      setProgKey(k => k + 1);
      setTimeout(() => { setCurrent(c => (c + 1) % SLIDES.length); setAnim(false); }, 320);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  const goTo = (i: number) => {
    if (i === current) return;
    setAnim(true);
    setProgKey(k => k + 1);
    setTimeout(() => { setCurrent(i); setAnim(false); }, 320);
  };

  return (
    <div className="hero-slider" style={{ position: "relative", borderRadius: 16, overflow: "hidden", flex: 1, minHeight: isCompact ? 220 : 0 }}>
      <style>{`@keyframes slider-progress { from { width: 0% } to { width: 100% } }`}</style>
      {/* glass bg */}
      <div style={{ position: "absolute", inset: 0, background: "hsl(var(--card) / 0.80)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid hsl(var(--card-border) / 0.85)" }} />

      {/* Nav arrows — bottom-right corner, above progress bar */}
      <div style={{ position: "absolute", right: 12, bottom: 16, zIndex: 10, display: "flex", gap: 4 }}>
        <button onClick={() => goTo((current - 1 + SLIDES.length) % SLIDES.length)}
          style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid hsl(var(--border))",
            background: "hsl(var(--card)/0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "hsl(var(--muted-foreground))", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "hsl(var(--card))"; e.currentTarget.style.color = "hsl(var(--foreground))"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "hsl(var(--card)/0.7)"; e.currentTarget.style.color = "hsl(var(--muted-foreground))"; }}>
          <ChevronLeft size={14} />
        </button>
        <button onClick={() => goTo((current + 1) % SLIDES.length)}
          style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid hsl(var(--border))",
            background: "hsl(var(--card)/0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "hsl(var(--muted-foreground))", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "hsl(var(--card))"; e.currentTarget.style.color = "hsl(var(--foreground))"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "hsl(var(--card)/0.7)"; e.currentTarget.style.color = "hsl(var(--muted-foreground))"; }}>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "hsl(var(--border)/0.3)", zIndex: 10 }}>
        <div key={progKey} style={{ height: "100%", background: slide.accent, borderRadius: 99,
          animation: "slider-progress 6s linear forwards" }} />
      </div>

      {/* person photo — 4:3 image fading leftward from ~50% */}
      {slide.slide && (
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0,
          width: "52%",
          opacity: anim ? 0 : 0.85,
          transition: "opacity 0.32s ease",
          pointerEvents: "none",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={slide.slide} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }} />
          {/* Fade from left: strong at 0% → transparent at ~55% */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, hsl(var(--card)) 0%, hsl(var(--card)) 15%, transparent 55%)" }} />
          {/* Fade at right and bottom edges */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 60%, hsl(var(--card)) 100%)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "28%", background: "linear-gradient(transparent, hsl(var(--card)))" }} />
        </div>
      )}

      {/* content */}
      <div style={{
        position: "relative", zIndex: 2,
        padding: "22px 24px",
        height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
        opacity: anim ? 0 : 1, transition: "opacity 0.32s ease",
      }}>
        <div>
          {/* tag */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 12px", borderRadius: 99, marginBottom: 16,
            background: `${slide.accent}18`, border: `1px solid ${slide.accent}40`,
            color: slide.accent, fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.05em",
          }}>
            <Zap size={9} color={slide.accent} /> {slide.tag.replace(/^[^ ]+ /, "")}
          </div>

          {/* main headline */}
          <h2 style={{
            fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 900,
            letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 10, color: "hsl(var(--foreground))",
            maxWidth: "58%",
          }}>
            {slide.headline.split(" ").map((w, i) => (
              <span key={i} style={{ color: i === 0 || i === 1 ? "hsl(var(--foreground))" : slide.accent }}>{i > 0 ? " " : ""}{w}</span>
            ))}
          </h2>

          {/* sub headline */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "3px 10px", borderRadius: 99, marginBottom: 12,
            background: `${slide.accent}14`, color: slide.accent,
            fontSize: 11, fontWeight: 700, fontFamily: "var(--font-display)",
          }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: slide.accent, animation: "logo-pulse 1.4s ease-in-out infinite" }} />
            {slide.subHeadline}
          </div>

          <p style={{ fontSize: 12, lineHeight: 1.65, color: "hsl(var(--muted-foreground))", maxWidth: "52%", marginBottom: 16 }}>
            {slide.text}
          </p>

          {/* CTA */}
          <button
            onClick={() => onNavigate("statistics")}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "8px 18px", borderRadius: 10,
              background: slide.accent, color: "#fff",
              fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)",
              border: "none", cursor: "pointer",
              boxShadow: `0 4px 18px -4px ${slide.accent}80`,
            }}
          >
            {slide.cta} <ArrowRight size={13} />
          </button>
        </div>

        {/* person label + dots */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          {slide.person && (
            <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", lineHeight: 1.4 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--foreground))", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
                {slide.person.name}
              </div>
              {slide.person.title.split("\n").map((l, i) => <div key={i}>{l}</div>)}
            </div>
          )}
          {!slide.person && <div />}
          {/* dots */}
          <div style={{ display: "flex", gap: 6 }}>
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} style={{
                width: i === current ? 20 : 6, height: 6, borderRadius: 99,
                background: i === current ? slide.accent : "hsl(var(--border))",
                border: "none", cursor: "pointer", padding: 0,
                transition: "all 0.3s ease",
              }} />
            ))}
          </div>
        </div>
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

  const matchCards = [...(data?.topMatchElo ?? []).slice(0, 2), ...(data?.topMatchDiff ?? []).slice(0, 2)];

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
        <KpiCard icon={Swords}   label="Total Games" value={(stats?.totalGames ?? 0).toLocaleString("cs-CZ")} sub={mode}  accent />
        <KpiCard icon={Users}    label="Hráči"        value={(stats?.uniquePlayers ?? 0).toString()}          sub="registrovaných" />
        <KpiCard icon={Activity} label="Medián ELO"   value={(stats?.medianElo ?? 0).toLocaleString("cs-CZ")} sub="ELO střed" />
        <KpiCard icon={Trophy}   label="Turnaje"      value={(stats?.uniqueTournaments ?? 0).toString()}      sub="celkem" />
        <KpiCard icon={Clock}    label="Poslední data" value={stats?.lastDataEntry ? stats.lastDataEntry.split(" ")[0] : "—"} sub="nejnovější záznam" />
      </div>

      {/* ── Row 2: Hero + matches ── */}
      <div
        className="anim-slide-up s2"
        style={{
          display: "grid",
          gridTemplateColumns: isCompact || isMid ? "1fr" : "1.55fr 1fr",
          gap: 10, flex: isCompact ? undefined : 1, minHeight: isCompact ? 280 : 0, flexShrink: 0,
        }}
      >
        {/* Hero slider */}
        <HeroSlider onNavigate={navigateTo} />

        {/* Interesting matches */}
        <Panel style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "12px 14px 10px", flexShrink: 0, borderBottom: "1px solid hsl(var(--border) / 0.5)" }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", marginBottom: 4 }}>
              Zajímavé zápasy
            </div>
          </div>
          <div style={{ overflowY: "auto", flex: 1, minHeight: 0, padding: "4px 0" }}>
            {matchCards.length === 0 ? (
              <div style={{ padding: "20px 14px", textAlign: "center", fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                {t(lang, "no_data")}
              </div>
            ) : (
              <>
                {/* Section: Největší ELO */}
                {(data?.topMatchElo ?? []).length > 0 && (
                  <>
                    <div style={{ padding: "8px 14px 4px", display: "flex", alignItems: "center", gap: 6 }}>
                      <Trophy size={10} color="hsl(var(--primary))" />
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>Největší ELO</span>
                      <span style={{ marginLeft: "auto", fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>avg ELO</span>
                    </div>
                    {(data?.topMatchElo ?? []).slice(0, 2).map((m, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderBottom: "1px solid hsl(var(--border) / 0.3)" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--foreground))", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.player1}</span>
                        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: "hsl(var(--muted-foreground))", flexShrink: 0 }}>{m.elo1}</span>
                        <div style={{
                          display: "flex", gap: 3, flexShrink: 0,
                          padding: "2px 7px", borderRadius: 6,
                          background: "hsl(var(--muted) / 0.5)",
                          fontSize: 10, fontWeight: 800, fontFamily: "var(--font-mono)",
                          color: "hsl(var(--primary))",
                        }}>
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
                  </>
                )}

                {/* Section: Největší rozdíl ELO */}
                {(data?.topMatchDiff ?? []).length > 0 && (
                  <>
                    <div style={{ padding: "8px 14px 4px", display: "flex", alignItems: "center", gap: 6 }}>
                      <TrendingUp size={10} color="hsl(24,88%,56%)" />
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>Největší rozdíl ELO</span>
                      <span style={{ marginLeft: "auto", fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>Δ ELO</span>
                    </div>
                    {(data?.topMatchDiff ?? []).slice(0, 2).map((m, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderBottom: i < 1 ? "1px solid hsl(var(--border) / 0.3)" : "none" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--foreground))", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.player1}</span>
                        <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", flexShrink: 0 }}>{m.elo1}</span>
                        <div style={{ padding: "2px 7px", borderRadius: 6, background: "hsl(var(--muted)/0.5)", fontSize: 10, fontWeight: 800, fontFamily: "var(--font-mono)", color: "hsl(var(--primary))", flexShrink: 0 }}>
                          <span style={{ color: m.result1?.startsWith?.("Won") ? "hsl(142,65%,50%)" : m.result1?.startsWith?.("Draw") ? "hsl(42,80%,52%)" : "hsl(0,65%,55%)", fontWeight: 800 }}>
                            {m.result1?.startsWith?.("Won") ? "W" : m.result1?.startsWith?.("Draw") ? "D" : "L"}
                          </span>
                          {" — "}
                          <span style={{ color: m.result2?.startsWith?.("Won") ? "hsl(142,65%,50%)" : m.result2?.startsWith?.("Draw") ? "hsl(42,80%,52%)" : "hsl(0,65%,55%)", fontWeight: 800 }}>
                            {m.result2?.startsWith?.("Won") ? "W" : m.result2?.startsWith?.("Draw") ? "D" : "L"}
                          </span>
                        </div>
                        <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", flexShrink: 0 }}>{m.elo2}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--foreground))", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>{m.player2}</span>
                      </div>
                    ))}
                  </>
                )}
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
              Milníky
            </div>
          </div>
          <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
            {milestones.length === 0 ? (
              <div style={{ padding: "16px 14px", textAlign: "center", fontSize: 11, color: "hsl(var(--muted-foreground))" }}>Žádné milníky</div>
            ) : milestones.slice(0, 4).map((m, i, arr) => (
              <MilestoneRow key={i} m={m} last={i === arr.length - 1} />
            ))}
          </div>
        </Panel>

        {/* ELO Distribution */}
        <Panel style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px 14px 8px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border) / 0.5)" }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>
              ELO Distribution
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
              {(prefetchCache?.[distMode]?.players?.length ?? stats?.uniquePlayers ?? 0)} hráčů · ×50
            </span>
          </div>
          <div className="dist-chart" style={{ flex: 1, padding: "8px 10px 4px", minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
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
              Top hráči
            </div>
            <button
              onClick={() => navigateTo("leaderboard")}
              style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9, fontWeight: 600, color: "hsl(var(--primary))", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)" }}
            >
              Celý žebříček <ArrowRight size={9} />
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
