"use client";

import { useState, useEffect, useRef } from "react";
import { useRatingMode } from "./RatingModeProvider";
import { useAppNav } from "./AppContext";
import { Player } from "@/lib/sheets";
import { avatarInitials } from "@/lib/utils";
import { t } from "@/lib/i18n";
import {
  GitCompare, Search, X, Target, Activity,
  Swords, TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import type { PrefetchCache } from "@/app/page";

// ── Glass panel (no overflow:hidden so dropdowns can escape) ──────────────────
function GPanel({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div style={{ position: "relative", borderRadius: 16, ...style }} className={className}>
      <div style={{
        position: "absolute", inset: 0,
        background: "hsl(var(--card) / 0.80)",
        backdropFilter: "blur(16px) saturate(150%)",
        WebkitBackdropFilter: "blur(16px) saturate(150%)",
        border: "1px solid hsl(var(--card-border) / 0.85)",
        borderRadius: 16,
        pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

function CT({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 9, padding: "7px 11px", fontFamily: "var(--font-mono)", fontSize: 11 }}>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.fill || p.stroke || "hsl(var(--primary))", fontWeight: 600 }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
        </div>
      ))}
    </div>
  );
}

function StatBar({ label, va, vb, fmt = String }: { label: string; va: number; vb: number; fmt?: (v: number) => string }) {
  const tot = va + vb || 1;
  const pA = Math.round((va / tot) * 100), pB = 100 - pA;
  const aW = va > vb, bW = vb > va;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <span style={{ fontSize: 13, fontWeight: aW ? 700 : 400, fontFamily: "var(--font-mono)", color: aW ? "hsl(152,72%,50%)" : "hsl(var(--foreground))" }}>{fmt(va)}</span>
        <span style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: bW ? 700 : 400, fontFamily: "var(--font-mono)", color: bW ? "hsl(265,68%,65%)" : "hsl(var(--foreground))" }}>{fmt(vb)}</span>
      </div>
      <div style={{ display: "flex", height: 6, borderRadius: 99, overflow: "hidden", gap: 2 }}>
        <div style={{ width: `${pA}%`, borderRadius: "99px 0 0 99px", background: aW ? "hsl(152,72%,50%)" : "hsl(152,72%,50%,0.30)", transition: "width .65s cubic-bezier(.4,0,.2,1)" }} />
        <div style={{ width: `${pB}%`, borderRadius: "0 99px 99px 0", background: bW ? "hsl(265,68%,65%)" : "hsl(265,68%,65%,0.30)", transition: "width .65s cubic-bezier(.4,0,.2,1)" }} />
      </div>
    </div>
  );
}

function DiffRow({ label, a, b, fmt = String }: { label: string; a: number; b: number; fmt?: (v: number) => string }) {
  const diff = a - b;
  const Icon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
  const col  = diff > 0 ? "hsl(152,72%,50%)" : diff < 0 ? "hsl(0,68%,56%)" : "hsl(var(--muted-foreground))";
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "8px 0", borderBottom: "1px solid hsl(var(--border) / 0.35)", gap: 10 }}>
      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)", color: "hsl(152,72%,50%)", width: 80, textAlign: "right", flexShrink: 0 }}>{fmt(a)}</span>
      <span style={{ flex: 1, textAlign: "center", fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", letterSpacing: "0.09em", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)", color: "hsl(265,68%,65%)", width: 80, textAlign: "left", flexShrink: 0 }}>{fmt(b)}</span>
      <Icon size={12} color={col} style={{ flexShrink: 0 }} />
    </div>
  );
}

// ── Player Selector – working search ─────────────────────────────────────────
function PlayerSelector({
  players, selected, onSelect, accentColor, placeholder, excludeId, label,
}: {
  players: Player[]; selected: Player | null; onSelect: (p: Player | null) => void;
  accentColor: string; placeholder: string; excludeId?: number; label: string;
}) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 20); }
    else setQuery("");
  }, [open]);

  const filtered = players
    .filter(p => p.id !== excludeId)
    .filter(p => !query.trim() || p.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 30);

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      {/* label */}
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", marginBottom: 6 }}>
        {label}
      </div>

      {/* trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 10, width: "100%",
          padding: "11px 14px",
          background: selected ? `${accentColor}14` : "hsl(var(--muted) / 0.4)",
          border: `1px solid ${selected ? `${accentColor}40` : "hsl(var(--border))"}`,
          borderRadius: 12, cursor: "pointer", transition: "all .18s", textAlign: "left",
        }}
      >
        {selected ? (
          <>
            <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: `${accentColor}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: accentColor, fontFamily: "var(--font-display)" }}>
              {avatarInitials(selected.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--foreground))", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.name}</div>
              <div style={{ fontSize: 11, color: accentColor, fontFamily: "var(--font-mono)", marginTop: 1 }}>{selected.rating.toLocaleString("cs-CZ")} pts · #{selected.id}</div>
            </div>
            <div
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === "Enter") { onSelect(null); } }}
              onClick={e => { e.stopPropagation(); onSelect(null); setOpen(false); }}
              style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: "hsl(var(--muted) / 0.6)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <X size={11} color="hsl(var(--muted-foreground))" />
            </div>
          </>
        ) : (
          <>
            <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, border: `2px dashed ${accentColor}45`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GitCompare size={16} color={`${accentColor}70`} />
            </div>
            <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", flex: 1 }}>{placeholder}</span>
            <Search size={13} color="hsl(var(--muted-foreground))" />
          </>
        )}
      </button>

      {/* dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
          borderRadius: 14,
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          boxShadow: "0 20px 48px hsl(222 28% 5% / 0.4)",
          zIndex: 9999,
          overflow: "hidden",
        }}>
          {/* search row */}
          <div style={{ padding: "9px 12px", borderBottom: "1px solid hsl(var(--border) / 0.6)", display: "flex", alignItems: "center", gap: 8, background: "hsl(var(--muted) / 0.35)" }}>
            <Search size={13} color="hsl(var(--muted-foreground))" style={{ flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === "Escape") setOpen(false); }}
              placeholder="Zadejte jméno hráče…"
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, fontFamily: "var(--font-body)", color: "hsl(var(--foreground))" }}
            />
            {query && (
              <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: "hsl(var(--muted-foreground))", padding: 0 }}>
                <X size={12} />
              </button>
            )}
          </div>

          {/* list */}
          <div style={{ maxHeight: 290, overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "16px 14px", textAlign: "center", fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                Žádný hráč nenalezen
              </div>
            ) : filtered.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => { onSelect(p); setOpen(false); }}
                style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "9px 14px", background: "transparent", border: "none", borderBottom: i < filtered.length - 1 ? "1px solid hsl(var(--border) / 0.30)" : "none", cursor: "pointer", textAlign: "left", transition: "background .12s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--muted) / 0.6)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontSize: 9, fontWeight: 700, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", width: 20, textAlign: "center", flexShrink: 0 }}>#{p.id}</span>
                <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: `${accentColor}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: accentColor, fontFamily: "var(--font-display)" }}>
                  {avatarInitials(p.name)}
                </div>
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

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CompareView({ prefetchCache }: { prefetchCache?: PrefetchCache }) {
  const { mode } = useRatingMode();
  const { lang } = useAppNav();
  const [players, setPlayers] = useState<Player[]>([]);
  const [pA, setPA] = useState<Player | null>(null);
  const [pB, setPB] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const c = prefetchCache?.[mode]?.players;
    if (c) { setPlayers(c); setLoading(false); return; }
    setLoading(true);
    fetch(`/api/players?mode=${mode}`)
      .then(r => r.json())
      .then(d => { setPlayers(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [mode, prefetchCache]);

  const buildRadar = (a: Player, b: Player) => {
    const norm = (v: number, mn: number, mx: number) => mx === mn ? 50 : Math.round(((v - mn) / (mx - mn)) * 100);
    const rs = players.map(p => p.rating), gs = players.map(p => p.games), ps = players.map(p => p.peak);
    const wrA = a.winrate <= 1 ? a.winrate * 100 : a.winrate;
    const wrB = b.winrate <= 1 ? b.winrate * 100 : b.winrate;
    return [
      { subject: t(lang, "rating"), A: norm(a.rating, Math.min(...rs), Math.max(...rs)), B: norm(b.rating, Math.min(...rs), Math.max(...rs)), fullMark: 100 },
      { subject: t(lang, "games"),  A: norm(a.games,  Math.min(...gs), Math.max(...gs)), B: norm(b.games,  Math.min(...gs), Math.max(...gs)), fullMark: 100 },
      { subject: "WR%",             A: norm(wrA, 0, 100), B: norm(wrB, 0, 100), fullMark: 100 },
      { subject: t(lang, "peak"),   A: norm(a.peak, Math.min(...ps), Math.max(...ps)), B: norm(b.peak, Math.min(...ps), Math.max(...ps)), fullMark: 100 },
      { subject: t(lang, "wins"),   A: norm(a.win, 0, Math.max(...gs)), B: norm(b.win, 0, Math.max(...gs)), fullMark: 100 },
    ];
  };

  const wrA = pA ? (pA.winrate <= 1 ? pA.winrate * 100 : pA.winrate) : 0;
  const wrB = pB ? (pB.winrate <= 1 ? pB.winrate * 100 : pB.winrate) : 0;

  return (
    <div style={{ height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* header */}
      <div className="anim-slide-up s1" style={{ flexShrink: 0 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 2 }}>{t(lang, "compare_title")}</h2>
        <p style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>{t(lang, "compare_desc")}</p>
      </div>

      {/* selectors — high z-index context so dropdowns float above everything */}
      <div className="anim-slide-up s2" style={{ display: "grid", gridTemplateColumns: "1fr 48px 1fr", gap: 12, alignItems: "flex-start", flexShrink: 0, position: "relative", zIndex: 200 }}>
        <PlayerSelector players={players} selected={pA} onSelect={setPA}
          accentColor="hsl(152,72%,50%)" placeholder={t(lang, "select_player_a")}
          label="Hráč A" excludeId={pB?.id} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 28 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "hsl(var(--muted)/0.5)", border: "1px solid hsl(var(--border))", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 12, color: "hsl(var(--muted-foreground))" }}>vs</div>
        </div>
        <PlayerSelector players={players} selected={pB} onSelect={setPB}
          accentColor="hsl(265,68%,65%)" placeholder={t(lang, "select_player_b")}
          label="Hráč B" excludeId={pA?.id} />
      </div>

      {/* empty state */}
      {(!pA || !pB) && (
        <GPanel style={{ flex: 1, minHeight: 200 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48, gap: 14, height: "100%", minHeight: 200 }}>
            <div style={{ width: 62, height: 62, borderRadius: 16, background: "hsl(var(--muted)/0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GitCompare size={28} color="hsl(var(--muted-foreground))" />
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700 }}>{t(lang, "compare_title")}</div>
            <div style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", textAlign: "center", maxWidth: 340 }}>
              {loading ? "Načítání hráčů…" : players.length === 0 ? "Žádní hráči k dispozici" : t(lang, "compare_desc")}
            </div>
            {!loading && players.length > 0 && (
              <div style={{ fontSize: 11, color: "hsl(var(--primary))", fontFamily: "var(--font-mono)", padding: "5px 14px", borderRadius: 99, background: "hsl(var(--primary)/0.10)", border: "1px solid hsl(var(--primary)/0.25)" }}>
                {players.length} hráčů k dispozici
              </div>
            )}
          </div>
        </GPanel>
      )}

      {/* comparison content */}
      {pA && pB && (
        <>
          <GPanel style={{ padding: 22 }} className="anim-slide-up s3">
            <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Activity size={14} color="hsl(var(--primary))" />{t(lang, "compare_stats")}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 10, height: 10, borderRadius: "50%", background: "hsl(152,72%,50%)" }} /><span style={{ fontSize: 13, fontWeight: 700, color: "hsl(152,72%,50%)" }}>{pA.name}</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 13, fontWeight: 700, color: "hsl(265,68%,65%)" }}>{pB.name}</span><div style={{ width: 10, height: 10, borderRadius: "50%", background: "hsl(265,68%,65%)" }} /></div>
            </div>
            <StatBar label={t(lang, "rating")}  va={pA.rating} vb={pB.rating} />
            <StatBar label={t(lang, "games")}   va={pA.games}  vb={pB.games}  />
            <StatBar label={t(lang, "wins")}    va={pA.win}    vb={pB.win}    />
            <StatBar label={t(lang, "losses")}  va={pA.loss}   vb={pB.loss}   />
            <StatBar label="WR %" va={parseFloat(wrA.toFixed(1))} vb={parseFloat(wrB.toFixed(1))} fmt={v => v.toFixed(1) + "%"} />
            <StatBar label={t(lang, "peak")}    va={pA.peak}   vb={pB.peak}   />
          </GPanel>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <GPanel style={{ padding: 20 }} className="anim-slide-up s4">
              <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <Target size={13} color="hsl(var(--primary))" />{t(lang, "compare_radar")}
              </div>
              <ResponsiveContainer width="100%" height={210}>
                <RadarChart data={buildRadar(pA, pB)}>
                  <PolarGrid stroke="hsl(var(--border)/0.5)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(var(--muted-foreground))" }} />
                  <Radar name={pA.name} dataKey="A" stroke="hsl(152,72%,50%)" fill="hsl(152,72%,50%,0.18)" strokeWidth={2} />
                  <Radar name={pB.name} dataKey="B" stroke="hsl(265,68%,65%)" fill="hsl(265,68%,65%,0.18)" strokeWidth={2} />
                  <Tooltip content={<CT />} />
                </RadarChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 4 }}>
                {[{ name: pA.name, color: "hsl(152,72%,50%)" }, { name: pB.name, color: "hsl(265,68%,65%)" }].map(l => (
                  <div key={l.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: l.color }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />{l.name}
                  </div>
                ))}
              </div>
            </GPanel>

            <GPanel style={{ padding: 20 }} className="anim-slide-up s5">
              <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <Swords size={13} color="hsl(var(--primary))" />Přímé srovnání
              </div>
              <DiffRow label={t(lang, "rating")} a={pA.rating} b={pB.rating} />
              <DiffRow label={t(lang, "peak")}   a={pA.peak}   b={pB.peak}   />
              <DiffRow label={t(lang, "games")}  a={pA.games}  b={pB.games}  />
              <DiffRow label={t(lang, "wins")}   a={pA.win}    b={pB.win}    />
              <DiffRow label={t(lang, "losses")} a={pA.loss}   b={pB.loss}   />
              <DiffRow label={t(lang, "draws")}  a={pA.draw}   b={pB.draw}   />
              <DiffRow label="WR %" a={parseFloat(wrA.toFixed(1))} b={parseFloat(wrB.toFixed(1))} fmt={v => v.toFixed(1) + "%"} />
            </GPanel>
          </div>

          <GPanel style={{ padding: 20 }} className="anim-slide-up">
            <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={13} color="hsl(var(--primary))" />Přehled statistik
            </div>
            <ResponsiveContainer width="100%" height={155}>
              <BarChart data={[{name:t(lang,"rating"),A:pA.rating,B:pB.rating},{name:t(lang,"games"),A:pA.games,B:pB.games},{name:t(lang,"wins"),A:pA.win,B:pB.win},{name:t(lang,"losses"),A:pA.loss,B:pB.loss}]} barGap={4} barCategoryGap="28%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.4)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CT />} />
                <Bar dataKey="A" name={pA.name} fill="hsl(152,72%,50%)" radius={[4,4,0,0]} />
                <Bar dataKey="B" name={pB.name} fill="hsl(265,68%,65%)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </GPanel>
        </>
      )}
    </div>
  );
}
