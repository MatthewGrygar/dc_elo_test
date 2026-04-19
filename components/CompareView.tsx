"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRatingMode } from "./RatingModeProvider";
import { useAppNav } from "./AppContext";
import { Player } from "@/lib/sheets";
import { PlayerDetailData } from "@/lib/dataFetchers";
import { avatarInitials } from "@/lib/utils";
import { t } from "@/lib/i18n";
import {
  GitCompare, Search, X, TrendingUp, TrendingDown, Minus, Activity,
  Target, Swords,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, LineChart, Line, ReferenceLine,
} from "recharts";
import type { PrefetchCache } from "@/app/page";

const CA = "hsl(152,72%,50%)";
const CB = "hsl(265,68%,65%)";
const mt = "hsl(var(--muted-foreground))";
const green = "hsl(142,65%,50%)";
const red   = "hsl(0,65%,55%)";
const amber = "hsl(42,80%,55%)";

// ── Shared glass panel ────────────────────────────────────────────────────────
function GPanel({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div style={{ position: "relative", borderRadius: 16, ...style }} className={className}>
      <div style={{ position: "absolute", inset: 0, background: "hsl(var(--card) / 0.80)", backdropFilter: "blur(16px) saturate(150%)", WebkitBackdropFilter: "blur(16px) saturate(150%)", border: "1px solid hsl(var(--card-border) / 0.85)", borderRadius: 16, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

// ── Shared stat comparison bar ────────────────────────────────────────────────
function StatBar({ label, va, vb, fmt = String }: { label: string; va: number; vb: number; fmt?: (v: number) => string }) {
  const tot = va + vb || 1;
  const pA = Math.round((va / tot) * 100), pB = 100 - pA;
  const aW = va > vb, bW = vb > va;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: aW ? 700 : 400, fontFamily: "var(--font-mono)", color: aW ? CA : "hsl(var(--foreground))" }}>{fmt(va)}</span>
        <span style={{ fontSize: 9, color: mt, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: bW ? 700 : 400, fontFamily: "var(--font-mono)", color: bW ? CB : "hsl(var(--foreground))" }}>{fmt(vb)}</span>
      </div>
      <div style={{ display: "flex", height: 5, borderRadius: 99, overflow: "hidden", gap: 2 }}>
        <div style={{ width: `${pA}%`, borderRadius: "99px 0 0 99px", background: aW ? CA : `${CA}30`, transition: "width .65s cubic-bezier(.4,0,.2,1)" }} />
        <div style={{ width: `${pB}%`, borderRadius: "0 99px 99px 0", background: bW ? CB : `${CB}30`, transition: "width .65s cubic-bezier(.4,0,.2,1)" }} />
      </div>
    </div>
  );
}

function DiffRow({ label, a, b, fmt = String }: { label: string; a: number; b: number; fmt?: (v: number) => string }) {
  const diff = a - b;
  const Icon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
  const col  = diff > 0 ? CA : diff < 0 ? CB : mt;
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "7px 0", borderBottom: "1px solid hsl(var(--border) / 0.3)", gap: 10 }}>
      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)", color: CA, width: 80, textAlign: "right", flexShrink: 0 }}>{fmt(a)}</span>
      <span style={{ flex: 1, textAlign: "center", fontSize: 9, color: mt, fontFamily: "var(--font-mono)", letterSpacing: "0.09em", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)", color: CB, width: 80, textAlign: "left", flexShrink: 0 }}>{fmt(b)}</span>
      <Icon size={11} color={col} style={{ flexShrink: 0 }} />
    </div>
  );
}

// ── Player Selector ───────────────────────────────────────────────────────────
function PlayerSelector({ players, selected, onSelect, accentColor, placeholder, excludeId, label, lang }: {
  players: Player[]; selected: Player | null; onSelect: (p: Player | null) => void;
  accentColor: string; placeholder: string; excludeId?: number; label: string; lang: "cs" | "en" | "fr";
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 20); else setQuery(""); }, [open]);

  const filtered = players.filter(p => p.id !== excludeId).filter(p => !query.trim() || p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 30);

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: mt, fontFamily: "var(--font-mono)", marginBottom: 6 }}>{label}</div>
      <button type="button" onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 14px", background: selected ? `${accentColor}14` : "hsl(var(--muted) / 0.4)", border: `1px solid ${selected ? `${accentColor}40` : "hsl(var(--border))"}`, borderRadius: 12, cursor: "pointer", transition: "all .18s", textAlign: "left" }}>
        {selected ? (
          <>
            <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: `${accentColor}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: accentColor, fontFamily: "var(--font-display)" }}>{avatarInitials(selected.name)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--foreground))", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.name}</div>
              <div style={{ fontSize: 11, color: accentColor, fontFamily: "var(--font-mono)", marginTop: 1 }}>{selected.rating.toLocaleString("cs-CZ")} pts · #{selected.id}</div>
            </div>
            <div role="button" tabIndex={0} onKeyDown={e => { if (e.key === "Enter") onSelect(null); }}
              onClick={e => { e.stopPropagation(); onSelect(null); setOpen(false); }}
              style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: "hsl(var(--muted)/0.6)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={11} color={mt} />
            </div>
          </>
        ) : (
          <>
            <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, border: `2px dashed ${accentColor}45`, display: "flex", alignItems: "center", justifyContent: "center" }}><GitCompare size={16} color={`${accentColor}70`} /></div>
            <span style={{ fontSize: 13, color: mt, flex: 1 }}>{placeholder}</span>
            <Search size={13} color={mt} />
          </>
        )}
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, borderRadius: 14, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", boxShadow: "0 20px 48px hsl(222 28% 5% / 0.4)", zIndex: 9999, overflow: "hidden" }}>
          <div style={{ padding: "9px 12px", borderBottom: "1px solid hsl(var(--border)/0.6)", display: "flex", alignItems: "center", gap: 8, background: "hsl(var(--muted)/0.35)" }}>
            <Search size={13} color={mt} style={{ flexShrink: 0 }} />
            <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === "Escape") setOpen(false); }}
              placeholder={t(lang, "cmp_search_player")}
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, fontFamily: "var(--font-body)", color: "hsl(var(--foreground))" }} />
            {query && <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: mt, padding: 0 }}><X size={12} /></button>}
          </div>
          <div style={{ maxHeight: 290, overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "16px 14px", textAlign: "center", fontSize: 12, color: mt }}>{t(lang, "cmp_not_found")}</div>
            ) : filtered.map((p, i) => (
              <button key={p.id} type="button" onClick={() => { onSelect(p); setOpen(false); }}
                style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "9px 14px", background: "transparent", border: "none", borderBottom: i < filtered.length - 1 ? "1px solid hsl(var(--border)/0.30)" : "none", cursor: "pointer", textAlign: "left", transition: "background .12s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--muted)/0.6)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <span style={{ fontSize: 9, fontWeight: 700, fontFamily: "var(--font-mono)", color: mt, width: 20, textAlign: "center", flexShrink: 0 }}>#{p.id}</span>
                <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: `${accentColor}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: accentColor, fontFamily: "var(--font-display)" }}>{avatarInitials(p.name)}</div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--foreground))", flex: 1 }}>{p.name}</span>
                <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 700, color: accentColor, flexShrink: 0 }}>{p.rating.toLocaleString("cs-CZ")}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Merged ELO trend chart ────────────────────────────────────────────────────
function EloOverlayChart({ dataA, dataB, nameA, nameB, lang }: { dataA: PlayerDetailData["eloTrend"]; dataB: PlayerDetailData["eloTrend"]; nameA: string; nameB: string; lang: "cs"|"en"|"fr" }) {
  // Align by date — collect all unique dates, carry forward last known ELO for each player
  const chartData = useMemo(() => {
    const allDates = Array.from(new Set([...dataA.map(d => d.date), ...dataB.map(d => d.date)]))
      .sort((a, b) => {
        const pa = a.split("."), pb = b.split(".");
        const da = pa.length === 3 ? new Date(+pa[2], +pa[1] - 1, +pa[0]).getTime() : 0;
        const db = pb.length === 3 ? new Date(+pb[2], +pb[1] - 1, +pb[0]).getTime() : 0;
        return da - db;
      });
    const mapA = new Map(dataA.map(d => [d.date, d.elo]));
    const mapB = new Map(dataB.map(d => [d.date, d.elo]));
    let lastA: number | null = null, lastB: number | null = null;
    return allDates.map(date => {
      if (mapA.has(date)) lastA = mapA.get(date)!;
      if (mapB.has(date)) lastB = mapB.get(date)!;
      return { date, [nameA]: lastA, [nameB]: lastB };
    });
  }, [dataA, dataB, nameA, nameB]);

  const allElos = [...dataA.map(d => d.elo), ...dataB.map(d => d.elo)].filter(Boolean);
  const yMin = allElos.length ? Math.min(...allElos) - 80 : "auto";
  const yMax = allElos.length ? Math.max(...allElos) + 80 : "auto";

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="cgA" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CA} stopOpacity={0.25} />
            <stop offset="95%" stopColor={CA} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="cgB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CB} stopOpacity={0.25} />
            <stop offset="95%" stopColor={CB} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.25)" />
        <XAxis dataKey="date" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: mt }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} width={42} domain={[yMin, yMax]} tickLine={false} axisLine={false} />
        <Tooltip content={({ active, payload, label }) => {
          if (!active || !payload?.length) return null;
          return (
            <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: 11, boxShadow: "0 4px 16px hsl(var(--foreground)/0.12)" }}>
              <div style={{ color: mt, marginBottom: 3, fontSize: 9 }}>{label}</div>
              {payload.map((p, i) => p.value != null && (
                <div key={i} style={{ color: p.stroke as string, fontWeight: 600 }}>{p.name}: {(p.value as number).toLocaleString("cs-CZ")}</div>
              ))}
            </div>
          );
        }} />
        <Line type="monotone" dataKey={nameA} stroke={CA} strokeWidth={2} dot={false} connectNulls />
        <Line type="monotone" dataKey={nameB} stroke={CB} strokeWidth={2} dot={false} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Weekday performance comparison ────────────────────────────────────────────
function WeekdayChart({ dataA, dataB, nameA, nameB }: { dataA: PlayerDetailData["weekdayPerf"]; dataB: PlayerDetailData["weekdayPerf"]; nameA: string; nameB: string }) {
  const merged = dataA.map((d, i) => ({
    day: d.shortDay,
    [nameA]: Math.round(d.winrate * 100),
    [nameB]: dataB[i] ? Math.round(dataB[i].winrate * 100) : null,
  }));
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={merged} barGap={3} barCategoryGap="30%" margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.25)" />
        <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: mt }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }} domain={[0, 100]} width={26} tickLine={false} axisLine={false} />
        <ReferenceLine y={50} stroke="hsl(var(--border))" strokeDasharray="3 2" />
        <Tooltip content={({ active, payload, label }) => {
          if (!active || !payload?.length) return null;
          return (
            <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, padding: "7px 11px", fontFamily: "var(--font-mono)", fontSize: 11 }}>
              <div style={{ color: mt, marginBottom: 2 }}>{label}</div>
              {payload.map((p, i) => <div key={i} style={{ color: p.fill as string, fontWeight: 600 }}>{p.name}: {p.value}%</div>)}
            </div>
          );
        }} />
        <Bar dataKey={nameA} fill={CA} radius={[3, 3, 0, 0]} maxBarSize={16} />
        <Bar dataKey={nameB} fill={CB} radius={[3, 3, 0, 0]} maxBarSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CompareView({ prefetchCache }: { prefetchCache?: PrefetchCache }) {
  const { mode } = useRatingMode();
  const { lang } = useAppNav();
  const [players, setPlayers] = useState<Player[]>([]);
  const [pA, setPA] = useState<Player | null>(null);
  const [pB, setPB] = useState<Player | null>(null);
  const [dataA, setDataA] = useState<PlayerDetailData | null>(null);
  const [dataB, setDataB] = useState<PlayerDetailData | null>(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    const c = prefetchCache?.[mode]?.players;
    if (c) { setPlayers(c); setListLoading(false); return; }
    setListLoading(true);
    fetch(`/api/players?mode=${mode}`).then(r => r.json()).then(d => { setPlayers(d); setListLoading(false); }).catch(() => setListLoading(false));
  }, [mode, prefetchCache]);

  useEffect(() => {
    if (!pA) { setDataA(null); return; }
    setLoadingA(true); setDataA(null);
    fetch(`/api/player-detail?mode=${mode}&name=${encodeURIComponent(pA.name)}`)
      .then(r => r.json()).then(d => { setDataA(d); setLoadingA(false); }).catch(() => setLoadingA(false));
  }, [pA, mode]);

  useEffect(() => {
    if (!pB) { setDataB(null); return; }
    setLoadingB(true); setDataB(null);
    fetch(`/api/player-detail?mode=${mode}&name=${encodeURIComponent(pB.name)}`)
      .then(r => r.json()).then(d => { setDataB(d); setLoadingB(false); }).catch(() => setLoadingB(false));
  }, [pB, mode]);

  const wrA = pA ? (pA.winrate <= 1 ? pA.winrate * 100 : pA.winrate) : 0;
  const wrB = pB ? (pB.winrate <= 1 ? pB.winrate * 100 : pB.winrate) : 0;

  const buildRadar = (a: Player, b: Player) => {
    const norm = (v: number, mn: number, mx: number) => mx === mn ? 50 : Math.round(((v - mn) / (mx - mn)) * 100);
    const rs = players.map(p => p.rating), gs = players.map(p => p.games), ps = players.map(p => p.peak);
    return [
      { subject: t(lang, "rating"), A: norm(a.rating, Math.min(...rs), Math.max(...rs)), B: norm(b.rating, Math.min(...rs), Math.max(...rs)), fullMark: 100 },
      { subject: t(lang, "games"),  A: norm(a.games,  Math.min(...gs), Math.max(...gs)), B: norm(b.games,  Math.min(...gs), Math.max(...gs)), fullMark: 100 },
      { subject: "WR%",             A: norm(wrA, 0, 100), B: norm(wrB, 0, 100), fullMark: 100 },
      { subject: t(lang, "peak"),   A: norm(a.peak, Math.min(...ps), Math.max(...ps)), B: norm(b.peak, Math.min(...ps), Math.max(...ps)), fullMark: 100 },
      { subject: t(lang, "wins"),   A: norm(a.win, 0, Math.max(...gs)), B: norm(b.win, 0, Math.max(...gs)), fullMark: 100 },
    ];
  };

  const fmt = (n: number) => n?.toLocaleString?.("cs-CZ") ?? "—";
  const fmtPct = (v: number) => v.toFixed(1) + "%";

  return (
    <div style={{ height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }} className="scrollbar-thin">

      {/* ── header ── */}
      <div style={{ flexShrink: 0 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 2 }}>{t(lang, "compare_title")}</h2>
        <p style={{ fontSize: 12, color: mt }}>{t(lang, "compare_desc")}</p>
      </div>

      {/* ── selectors ── */}
      <div className="mobile-compare-grid" style={{ display: "grid", gridTemplateColumns: "1fr 48px 1fr", gap: 12, alignItems: "flex-start", flexShrink: 0, position: "relative", zIndex: 200 }}>
        <PlayerSelector players={players} selected={pA} onSelect={setPA} accentColor={CA} placeholder={t(lang, "select_player_a")} label={t(lang, "cmp_player_a")} excludeId={pB?.id} lang={lang} />
        <div className="vs-divider" style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 28 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "hsl(var(--muted)/0.5)", border: "1px solid hsl(var(--border))", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 12, color: mt }}>vs</div>
        </div>
        <PlayerSelector players={players} selected={pB} onSelect={setPB} accentColor={CB} placeholder={t(lang, "select_player_b")} label={t(lang, "cmp_player_b")} excludeId={pA?.id} lang={lang} />
      </div>

      {/* ── empty state ── */}
      {(!pA || !pB) && (
        <GPanel style={{ flex: 1, minHeight: 200 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48, gap: 14, height: "100%", minHeight: 200 }}>
            <div style={{ width: 62, height: 62, borderRadius: 16, background: "hsl(var(--muted)/0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GitCompare size={28} color={mt} />
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700 }}>{t(lang, "compare_title")}</div>
            <div style={{ fontSize: 13, color: mt, textAlign: "center", maxWidth: 340 }}>
              {listLoading ? t(lang, "cmp_loading") : players.length === 0 ? t(lang, "cmp_no_players") : t(lang, "compare_desc")}
            </div>
            {!listLoading && players.length > 0 && (
              <div style={{ fontSize: 11, color: "hsl(var(--primary))", fontFamily: "var(--font-mono)", padding: "5px 14px", borderRadius: 99, background: "hsl(var(--primary)/0.10)", border: "1px solid hsl(var(--primary)/0.25)" }}>
                {players.length} {t(lang, "cmp_available")}
              </div>
            )}
          </div>
        </GPanel>
      )}

      {/* ── comparison content ── */}
      {pA && pB && (
        <>
          {/* ── Hero row: side-by-side player cards ── */}
          <div className="mobile-stack" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[{ p: pA, data: dataA, loading: loadingA, color: CA }, { p: pB, data: dataB, loading: loadingB, color: CB }].map(({ p, data, loading, color }) => {
              const s = data?.summary;
              const c = data?.computed;
              const wr = p.winrate <= 1 ? p.winrate * 100 : p.winrate;
              const eloChange = c?.eloChange30d ?? 0;
              const streak = c?.currentStreak;
              const streakColor = streak?.type === "win" ? green : streak?.type === "lose" ? red : mt;
              return (
                <GPanel key={p.id} style={{ padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}18`, border: `2px solid ${color}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 900, color, fontFamily: "var(--font-display)", flexShrink: 0 }}>
                      {avatarInitials(p.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "var(--font-display)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color }}>{p.name}</div>
                      <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: mt }}>#{p.id} · {s?.lastMatch ?? "—"}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 28, fontWeight: 900, fontFamily: "var(--font-mono)", color, lineHeight: 1 }}>{fmt(p.rating)}</div>
                      <div style={{ fontSize: 9, color: mt, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.07em" }}>ELO</div>
                    </div>
                  </div>
                  {loading ? (
                    <div style={{ height: 60, borderRadius: 10, background: "hsl(var(--muted)/0.4)", animation: "cv-pulse 1.5s ease infinite" }} />
                  ) : s ? (
                    <>
                      {/* W/L/D row */}
                      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                        {[{ l: "W", v: s.wins, c: green }, { l: "D", v: s.draws, c: amber }, { l: "L", v: s.losses, c: red }].map(r => (
                          <div key={r.l} style={{ flex: 1, padding: "6px 8px", borderRadius: 9, background: `${r.c}12`, border: `1px solid ${r.c}28`, textAlign: "center" }}>
                            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: "var(--font-mono)", color: r.c, lineHeight: 1 }}>{r.v}</div>
                            <div style={{ fontSize: 8, color: mt, fontFamily: "var(--font-mono)" }}>{r.l}</div>
                          </div>
                        ))}
                      </div>
                      {/* WR bar */}
                      <div style={{ display: "flex", height: 3, borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
                        <div style={{ flex: s.wins, background: green }} />
                        <div style={{ flex: s.draws, background: amber }} />
                        <div style={{ flex: s.losses, background: red }} />
                      </div>
                      {/* Key stats */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                        {[
                          { l: t(lang, "winrate"), v: fmtPct(wr) },
                          { l: t(lang, "pd_peak_elo"), v: fmt(s.peakElo) },
                          { l: t(lang, "cmp_elo_delta_30d"), v: `${eloChange >= 0 ? "+" : ""}${fmt(eloChange)}` },
                          { l: t(lang, "cmp_total_games"), v: fmt(s.totalGames) },
                        ].map(kv => (
                          <div key={kv.l} style={{ padding: "5px 8px", borderRadius: 7, background: "hsl(var(--muted)/0.3)" }}>
                            <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: mt, letterSpacing: "0.07em", textTransform: "uppercase" }}>{kv.l}</div>
                            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)", color: "hsl(var(--foreground))", marginTop: 1 }}>{kv.v}</div>
                          </div>
                        ))}
                      </div>
                      {/* Streak badge */}
                      {streak && streak.length > 0 && (
                        <div style={{ marginTop: 8, padding: "3px 10px", borderRadius: 99, background: `${streakColor}18`, border: `1px solid ${streakColor}35`, display: "inline-block", fontSize: 10, fontFamily: "var(--font-mono)", color: streakColor, fontWeight: 700 }}>
                          {streak.type === "win" ? "🔥" : streak.type === "lose" ? "💀" : "➖"} ×{streak.length}
                        </div>
                      )}
                    </>
                  ) : null}
                </GPanel>
              );
            })}
          </div>

          {/* ── ELO trend overlay ── */}
          {dataA && dataB && (
            <GPanel style={{ padding: "16px 18px" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                <TrendingUp size={14} color="hsl(var(--primary))" />{t(lang, "cmp_elo_overlap")}
              </div>
              <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
                {[{ name: pA.name, color: CA }, { name: pB.name, color: CB }].map(l => (
                  <div key={l.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "var(--font-mono)", color: l.color }}>
                    <div style={{ width: 16, height: 2, background: l.color, borderRadius: 1 }} />{l.name}
                  </div>
                ))}
              </div>
              <EloOverlayChart dataA={dataA.eloTrend} dataB={dataB.eloTrend} nameA={pA.name} nameB={pB.name} lang={lang} />
            </GPanel>
          )}

          {/* ── Stat comparison + Radar ── */}
          <div className="mobile-stack" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <GPanel style={{ padding: 20 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <Activity size={13} color="hsl(var(--primary))" />{t(lang, "compare_stats")}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: CA }}>{pA.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: CB }}>{pB.name}</span>
              </div>
              <StatBar label={t(lang, "rating")} va={pA.rating} vb={pB.rating} />
              <StatBar label={t(lang, "games")}  va={pA.games}  vb={pB.games} />
              <StatBar label={t(lang, "wins")}   va={pA.win}    vb={pB.win} />
              <StatBar label={t(lang, "losses")} va={pA.loss}   vb={pB.loss} />
              <StatBar label="WR %" va={parseFloat(wrA.toFixed(1))} vb={parseFloat(wrB.toFixed(1))} fmt={fmtPct} />
              <StatBar label={t(lang, "peak")}   va={pA.peak}   vb={pB.peak} />
            </GPanel>

            <GPanel style={{ padding: 20 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <Target size={13} color="hsl(var(--primary))" />{t(lang, "compare_radar")}
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={buildRadar(pA, pB)}>
                  <PolarGrid stroke="hsl(var(--border)/0.5)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: mt }} />
                  <Radar name={pA.name} dataKey="A" stroke={CA} fill={CA} fillOpacity={0.15} strokeWidth={2} />
                  <Radar name={pB.name} dataKey="B" stroke={CB} fill={CB} fillOpacity={0.15} strokeWidth={2} />
                  <Tooltip content={({ active, payload }: any) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 9, padding: "7px 11px", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                        {payload.map((p: any, i: number) => <div key={i} style={{ color: p.stroke, fontWeight: 600 }}>{p.name}: {p.value}</div>)}
                      </div>
                    );
                  }} />
                </RadarChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
                {[{ name: pA.name, color: CA }, { name: pB.name, color: CB }].map(l => (
                  <div key={l.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: l.color }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />{l.name}
                  </div>
                ))}
              </div>
            </GPanel>
          </div>

          {/* ── Advanced stats comparison (when both loaded) ── */}
          {dataA && dataB && (
            <div className="mobile-stack" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {/* Direct diff table */}
              <GPanel style={{ padding: 20 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <Swords size={13} color="hsl(var(--primary))" />{t(lang, "cmp_direct")}
                </div>
                <DiffRow label={t(lang, "rating")} a={pA.rating} b={pB.rating} />
                <DiffRow label={t(lang, "peak")}   a={pA.peak}   b={pB.peak} />
                <DiffRow label={t(lang, "cmp_elo_delta_30d")} a={dataA.computed.eloChange30d} b={dataB.computed.eloChange30d} fmt={v => (v >= 0 ? "+" : "") + fmt(v)} />
                <DiffRow label={t(lang, "games")}  a={pA.games}  b={pB.games} />
                <DiffRow label={t(lang, "wins")}   a={pA.win}    b={pB.win} />
                <DiffRow label="WR %"              a={parseFloat(wrA.toFixed(1))} b={parseFloat(wrB.toFixed(1))} fmt={fmtPct} />
                <DiffRow label={t(lang, "cmp_avg_delta")} a={dataA.computed.avgDelta} b={dataB.computed.avgDelta} fmt={v => (v >= 0 ? "+" : "") + v.toFixed(1)} />
                <DiffRow label={t(lang, "cmp_win_delta")} a={dataA.computed.avgWinDelta} b={dataB.computed.avgWinDelta} fmt={v => "+" + v.toFixed(1)} />
              </GPanel>

              {/* Weekday performance */}
              <GPanel style={{ padding: 20 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                  {t(lang, "cmp_wr_day")}
                </div>
                <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
                  {[{ name: pA.name, color: CA }, { name: pB.name, color: CB }].map(l => (
                    <div key={l.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontFamily: "var(--font-mono)", color: l.color }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />{l.name}
                    </div>
                  ))}
                </div>
                <WeekdayChart dataA={dataA.weekdayPerf} dataB={dataB.weekdayPerf} nameA={pA.name} nameB={pB.name} />
              </GPanel>
            </div>
          )}

          {/* ── Momentum comparison ── */}
          {dataA && dataB && (
            <GPanel style={{ padding: 20 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                {t(lang, "cmp_rolling")}
              </div>
              <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
                {[{ name: pA.name, color: CA }, { name: pB.name, color: CB }].map(l => (
                  <div key={l.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontFamily: "var(--font-mono)", color: l.color }}>
                    <div style={{ width: 16, height: 2, background: l.color, borderRadius: 1 }} />{l.name}
                  </div>
                ))}
              </div>
              {(() => {
                const mA = dataA.rollingMomentum, mB = dataB.rollingMomentum;
                const maxLen = Math.max(mA.length, mB.length);
                const merged = Array.from({ length: maxLen }, (_, i) => ({
                  idx: i + 1,
                  [pA.name]: mA[i]?.momentum ?? null,
                  [pB.name]: mB[i]?.momentum ?? null,
                }));
                return (
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={merged} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.2)" />
                      <XAxis dataKey="idx" tick={{ fontSize: 8, fontFamily: "var(--font-mono)", fill: mt }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 8, fontFamily: "var(--font-mono)" }} width={28} tickLine={false} axisLine={false} />
                      <ReferenceLine y={0} stroke="hsl(var(--border))" />
                      <Tooltip content={({ active, payload, label }: any) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 9, padding: "7px 11px", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                            <div style={{ color: mt, fontSize: 9, marginBottom: 2 }}>#{label}</div>
                            {payload.map((p: any, i: number) => p.value != null && <div key={i} style={{ color: p.stroke, fontWeight: 600 }}>{p.name}: {p.value?.toFixed(2)}</div>)}
                          </div>
                        );
                      }} />
                      <Line type="monotone" dataKey={pA.name} stroke={CA} strokeWidth={1.5} dot={false} connectNulls />
                      <Line type="monotone" dataKey={pB.name} stroke={CB} strokeWidth={1.5} dot={false} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                );
              })()}
            </GPanel>
          )}

          {/* ── Loading overlay when data is being fetched ── */}
          {(loadingA || loadingB) && (
            <div style={{ padding: "12px 16px", borderRadius: 12, background: "hsl(var(--muted)/0.3)", border: "1px solid hsl(var(--border))", fontSize: 12, fontFamily: "var(--font-mono)", color: mt, textAlign: "center" }}>
              {loadingA && loadingB
                ? t(lang, "cmp_loading_data_both").replace("{a}", pA.name).replace("{b}", pB.name)
                : loadingA
                  ? t(lang, "cmp_loading_data_one").replace("{name}", pA.name)
                  : t(lang, "cmp_loading_data_one").replace("{name}", pB.name)}
            </div>
          )}
        </>
      )}

      <style jsx global>{`@keyframes cv-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}
