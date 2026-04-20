"use client";

import { useState, useEffect, useMemo } from "react";
import { Save, RefreshCw, Search, X, ChevronDown, Sparkles, Zap, Star, Trophy, ChevronUp } from "lucide-react";

interface Match {
  matchId: string;
  player1: string; elo1: number; result1: string;
  player2: string; elo2: number; result2: string;
  avgElo: number; eloDiff: number; date: string;
}

interface FeaturedMatch {
  matchId: string;
  category: string;
  categoryLabel: string;
  categoryEmoji: string;
}

const green = "hsl(152,72%,45%)";
const greenBg = "hsl(152 72% 45% / 0.1)";
const greenBorder = "hsl(152 72% 45% / 0.28)";

const PRESET_CATS = [
  { category: "high-elo",  label: "Nejvyšší ELO",       emoji: "⭐" },
  { category: "elo-diff",  label: "Největší rozdíl ELO", emoji: "⚡" },
];
const CUSTOM_EMOJIS = ["🎯","🔥","💥","🏆","👑","⚔️","🎲","🌟","💎","🎖️","🚀","⚡"];

function resultColor(r: string) {
  const s = r?.toLowerCase() ?? "";
  if (s.startsWith("won")) return green;
  if (s.startsWith("lost")) return "hsl(0,72%,60%)";
  return "hsl(var(--muted-foreground))";
}

function resultLetter(r: string) {
  if (r?.startsWith?.("Won")) return "W";
  if (r?.startsWith?.("Draw")) return "D";
  return "L";
}

// ── Per-match category picker ─────────────────────────────────────────────────
function CategoryPicker({ value, onChange, matchId }: {
  value: FeaturedMatch | null;
  onChange: (fm: FeaturedMatch | null) => void;
  matchId: string;
}) {
  const [customLabel, setCustomLabel] = useState("");
  const [customEmoji, setCustomEmoji] = useState("🎯");
  const [showCustom, setShowCustom] = useState(false);
  const isCustom = value?.category === "custom";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      <button onClick={() => { onChange(null); setShowCustom(false); }} style={{
        padding: "3px 9px", borderRadius: 6, fontSize: 11, cursor: "pointer",
        border: "1px solid", fontFamily: "var(--font-mono)", fontWeight: 600,
        borderColor: !value ? greenBorder : "hsl(var(--border))",
        background: !value ? greenBg : "transparent",
        color: !value ? green : "hsl(var(--muted-foreground))",
      }}>—</button>

      {PRESET_CATS.map((p) => {
        const active = value?.category === p.category;
        return (
          <button key={p.category} onClick={() => { onChange({ matchId, category: p.category, categoryLabel: p.label, categoryEmoji: p.emoji }); setShowCustom(false); }} style={{
            padding: "3px 9px", borderRadius: 6, fontSize: 11, cursor: "pointer",
            border: "1px solid", fontFamily: "var(--font-mono)", fontWeight: 600,
            borderColor: active ? greenBorder : "hsl(var(--border))",
            background: active ? greenBg : "transparent",
            color: active ? green : "hsl(var(--muted-foreground))",
          }}>{p.emoji} {p.label}</button>
        );
      })}

      <button onClick={() => setShowCustom((s) => !s)} style={{
        padding: "3px 9px", borderRadius: 6, fontSize: 11, cursor: "pointer",
        border: "1px solid", fontFamily: "var(--font-mono)", fontWeight: 600,
        borderColor: isCustom ? greenBorder : "hsl(var(--border))",
        background: isCustom ? greenBg : "transparent",
        color: isCustom ? green : "hsl(var(--muted-foreground))",
        display: "flex", alignItems: "center", gap: 4,
      }}>
        {isCustom ? `${value!.categoryEmoji} ${value!.categoryLabel}` : "Vlastní"} <ChevronDown size={10} />
      </button>

      {showCustom && (
        <div style={{
          width: "100%", marginTop: 4, padding: "10px 12px", borderRadius: 8,
          background: "hsl(var(--muted)/0.4)", border: "1px solid hsl(var(--border))",
          display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap",
        }}>
          {CUSTOM_EMOJIS.map((e) => (
            <button key={e} type="button" onClick={() => setCustomEmoji(e)} style={{
              width: 28, height: 28, borderRadius: 6, fontSize: 16, cursor: "pointer",
              border: `2px solid ${customEmoji === e ? green : "transparent"}`,
              background: customEmoji === e ? greenBg : "hsl(var(--muted)/0.5)",
            }}>{e}</button>
          ))}
          <input
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="Název kategorie…"
            style={{
              flex: 1, minWidth: 120, padding: "5px 10px", borderRadius: 7, fontSize: 12,
              background: "hsl(var(--muted)/0.5)", border: "1px solid hsl(var(--border))",
              color: "hsl(var(--foreground))", fontFamily: "var(--font-body)", outline: "none",
            }}
          />
          <button onClick={() => {
            if (!customLabel.trim()) return;
            onChange({ matchId, category: "custom", categoryLabel: customLabel.trim(), categoryEmoji: customEmoji });
            setShowCustom(false);
          }} style={{
            padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer",
            background: green, color: "#000", border: "none", fontFamily: "var(--font-body)",
          }}>OK</button>
        </div>
      )}
    </div>
  );
}

// ── Compact match card (used in recommendations and preview) ──────────────────
function MatchCard({ m, badge, action, actionLabel, onRemove }: {
  m: Match;
  badge?: string;
  action?: () => void;
  actionLabel?: string;
  onRemove?: () => void;
}) {
  return (
    <div style={{
      borderRadius: 8, overflow: "hidden",
      background: "hsl(var(--card)/0.8)", border: "1px solid hsl(var(--border))",
      position: "relative",
    }}>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${green}, transparent)` }} />
      <div style={{ padding: "8px 10px" }}>
        {onRemove && (
          <button onClick={onRemove} title="Odebrat" style={{
            position: "absolute", top: 6, right: 6,
            width: 18, height: 18, borderRadius: 4, border: "none", cursor: "pointer",
            background: "hsl(var(--destructive)/0.15)", color: "hsl(var(--destructive))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 900, padding: 0,
          }}>✕</button>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 6, paddingRight: onRemove ? 20 : 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: resultColor(m.result1), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.player1}</div>
            <div style={{ fontSize: 9, color: "hsl(var(--muted-foreground))" }}>ELO {m.elo1}</div>
          </div>
          <div style={{
            padding: "2px 7px", borderRadius: 5, fontSize: 9, fontWeight: 800,
            background: "hsl(var(--muted)/0.5)", color: "hsl(var(--muted-foreground))",
            fontFamily: "var(--font-mono)", flexShrink: 0,
          }}>
            {resultLetter(m.result1)} — {resultLetter(m.result2)}
          </div>
          <div style={{ flex: 1, minWidth: 0, textAlign: "right" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: resultColor(m.result2), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.player2}</div>
            <div style={{ fontSize: 9, color: "hsl(var(--muted-foreground))" }}>ELO {m.elo2}</div>
          </div>
        </div>
        <div style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", marginTop: 4, display: "flex", gap: 8, alignItems: "center" }}>
          <span>{m.date}</span>
          <span>Δ {Math.round(m.eloDiff)}</span>
          <span>⌀ {Math.round(m.avgElo)}</span>
          {badge && <span style={{ marginLeft: "auto", fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: greenBg, border: `1px solid ${greenBorder}`, color: green, fontFamily: "var(--font-mono)" }}>{badge}</span>}
          {action && actionLabel && (
            <button onClick={action} style={{
              marginLeft: "auto", padding: "2px 8px", borderRadius: 5, fontSize: 10, fontWeight: 700, cursor: "pointer",
              background: greenBg, border: `1px solid ${greenBorder}`, color: green, fontFamily: "var(--font-body)",
            }}>{actionLabel}</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Recommendations section ───────────────────────────────────────────────────
function RecommendedSection({ pool, featured, onAdd }: {
  pool: Match[];
  featured: FeaturedMatch[];
  onAdd: (matchId: string, fm: Omit<FeaturedMatch, "matchId">) => void;
}) {
  const featuredSet = useMemo(() => new Set(featured.map((f) => f.matchId)), [featured]);

  const recs = useMemo(() => {
    if (pool.length === 0) return [];

    // Highest average ELO
    const byAvg = [...pool].sort((a, b) => b.avgElo - a.avgElo).slice(0, 3);

    // Biggest ELO difference
    const byDiff = [...pool].sort((a, b) => b.eloDiff - a.eloDiff).slice(0, 3);

    // Biggest upsets: higher-rated player lost
    const upsets = pool.filter((m) => {
      const p1stronger = m.elo1 > m.elo2;
      const p1won = m.result1.startsWith("Won");
      return (p1stronger && !p1won && !m.result1.startsWith("Draw")) ||
             (!p1stronger && p1won);
    }).sort((a, b) => b.eloDiff - a.eloDiff).slice(0, 3);

    // Most recent high-stakes (top 20% by avgElo among last 30d)
    const sortedByDate = [...pool].sort((a, b) => {
      const parse = (s: string) => {
        const p = s.split("."); return new Date(+p[2], +p[1]-1, +p[0]).getTime();
      };
      return parse(b.date) - parse(a.date);
    });
    const recent = sortedByDate.slice(0, Math.max(10, Math.floor(pool.length * 0.25)));
    const recentHighElo = [...recent].sort((a, b) => b.avgElo - a.avgElo).slice(0, 3);

    return [
      { label: "Nejvyšší ELO průměr", emoji: "⭐", category: "high-elo", categoryLabel: "Nejvyšší ELO", matches: byAvg },
      { label: "Největší rozdíl ELO", emoji: "⚡", category: "elo-diff", categoryLabel: "Největší rozdíl ELO", matches: byDiff },
      { label: "Největší Upsets", emoji: "🎭", category: "custom", categoryLabel: "Upsets", matches: upsets },
      { label: "Poslední zajímavé", emoji: "🔥", category: "high-elo", categoryLabel: "Nejnovější", matches: recentHighElo },
    ].filter((g) => g.matches.length > 0);
  }, [pool]);

  const [open, setOpen] = useState(true);

  if (recs.length === 0) return null;

  return (
    <div style={{
      marginBottom: "1rem",
      background: "hsl(var(--card)/0.4)", border: "1px solid hsl(var(--border))",
      borderRadius: 10, overflow: "hidden",
    }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 8,
          padding: "10px 14px", background: "none", border: "none", cursor: "pointer",
          fontFamily: "var(--font-body)", textAlign: "left",
        }}
      >
        <Sparkles size={13} style={{ color: "hsl(42,80%,55%)", flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: "hsl(42,80%,55%)" }}>Doporučené zápasy</span>
        <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", flex: 1 }}>— navrhujeme přidat do výběru</span>
        <ChevronDown size={13} style={{ color: "hsl(var(--muted-foreground))", transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
      </button>

      {open && (
        <div style={{ borderTop: "1px solid hsl(var(--border))", padding: "10px 14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            {recs.map((group) => (
              <div key={group.category + group.label}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(var(--muted-foreground))", marginBottom: 6 }}>
                  {group.emoji} {group.label}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {group.matches.slice(0, 2).map((m) => {
                    const alreadyIn = featuredSet.has(m.matchId);
                    return (
                      <MatchCard
                        key={m.matchId}
                        m={m}
                        badge={alreadyIn ? "✓ Přidáno" : undefined}
                        action={alreadyIn ? undefined : () => onAdd(m.matchId, { category: group.category, categoryLabel: group.categoryLabel, categoryEmoji: group.emoji })}
                        actionLabel={alreadyIn ? undefined : "+ Přidat"}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Preview panel ─────────────────────────────────────────────────────────────
function PreviewPanel({ featured, pool, onRemove, onReorder, onSave, saving, saved }: {
  featured: FeaturedMatch[];
  pool: Match[];
  onRemove: (matchId: string) => void;
  onReorder: (matchId: string, dir: "up" | "down") => void;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
}) {
  const matchMap = useMemo(() => new Map(pool.map((m) => [m.matchId, m])), [pool]);

  const groups = useMemo(() => {
    const map = new Map<string, { label: string; emoji: string; matches: { fm: FeaturedMatch; m: Match; idx: number }[] }>();
    featured.forEach((fm, idx) => {
      const m = matchMap.get(fm.matchId);
      if (!m) return;
      const key = `${fm.category}::${fm.categoryLabel}`;
      if (!map.has(key)) map.set(key, { label: fm.categoryLabel, emoji: fm.categoryEmoji, matches: [] });
      map.get(key)!.matches.push({ fm, m, idx });
    });
    return [...map.values()];
  }, [featured, matchMap]);

  return (
    <div style={{
      position: "sticky", top: "1.5rem",
      background: "hsl(var(--card)/0.5)", border: "1px solid hsl(var(--border))",
      borderRadius: 14, overflow: "hidden",
    }}>
      {/* Header with Save button */}
      <div style={{
        padding: "10px 14px", borderBottom: "1px solid hsl(var(--border))",
        background: "hsl(var(--card)/0.6)",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsl(var(--muted-foreground))" }}>
            Náhled — Zajímavé zápasy
          </div>
          <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", marginTop: 2 }}>
            {featured.length === 0 ? "Bez výběru = automatické" : `${featured.length} zápasů, ${groups.length} kategorií`}
          </div>
        </div>
        <button onClick={onSave} disabled={saving} style={{
          display: "flex", alignItems: "center", gap: 5, padding: "5px 12px",
          background: saving ? greenBg : saved ? "hsl(var(--card))" : green,
          color: saving || saved ? green : "#000",
          border: `1px solid ${greenBorder}`, borderRadius: 7, flexShrink: 0,
          fontWeight: 700, fontSize: 11, cursor: saving ? "not-allowed" : "pointer",
          fontFamily: "var(--font-body)",
        }}>
          <Save size={11} /> {saving ? "Ukládám…" : saved ? "Uloženo ✓" : "Uložit"}
        </button>
      </div>

      <div style={{ maxHeight: "calc(100vh - 240px)", overflowY: "auto", padding: "10px" }}>
        {groups.length === 0 ? (
          <div style={{
            padding: "1.5rem 1rem", textAlign: "center", borderRadius: 8,
            background: "hsl(var(--muted)/0.3)", border: "1px dashed hsl(var(--border))",
            fontSize: 11, color: "hsl(var(--muted-foreground))", margin: "4px 0",
          }}>
            Žádný vybraný zápas.<br />Zobrazí se automaticky vybrané.
          </div>
        ) : (
          groups.map((group, gi) => (
            <div key={gi} style={{ marginBottom: 12 }}>
              <div style={{
                fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)",
                padding: "4px 8px", marginBottom: 4,
                display: "flex", alignItems: "center", gap: 5,
              }}>
                <span>{group.emoji}</span> {group.label}
              </div>
              {group.matches.map(({ fm, m, idx }) => (
                <div key={fm.matchId} style={{ marginBottom: 5, display: "flex", gap: 4, alignItems: "stretch" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <button onClick={() => onReorder(fm.matchId, "up")} disabled={idx === 0} title="Přesunout nahoru" style={{ width: 18, height: 18, borderRadius: 4, border: "1px solid hsl(var(--border))", background: "hsl(var(--muted)/0.4)", color: idx === 0 ? "hsl(var(--muted-foreground)/0.3)" : "hsl(var(--muted-foreground))", cursor: idx === 0 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 }}>
                      <ChevronUp size={10} />
                    </button>
                    <button onClick={() => onReorder(fm.matchId, "down")} disabled={idx === featured.length - 1} title="Přesunout dolů" style={{ width: 18, height: 18, borderRadius: 4, border: "1px solid hsl(var(--border))", background: "hsl(var(--muted)/0.4)", color: idx === featured.length - 1 ? "hsl(var(--muted-foreground)/0.3)" : "hsl(var(--muted-foreground))", cursor: idx === featured.length - 1 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 }}>
                      <ChevronDown size={10} />
                    </button>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <MatchCard m={m} onRemove={() => onRemove(fm.matchId)} />
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const REGIONS = [
  { value: "ALL", label: "🌍 Všechny (ALL)" },
  { value: "FR",  label: "🇫🇷 Francie (FR)"  },
  { value: "CZ",  label: "🇨🇿 Česko (CZ)"    },
] as const;

export default function MatchesPage() {
  const [pool, setPool]           = useState<Match[]>([]);
  const [featured, setFeatured]   = useState<FeaturedMatch[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [days, setDays]           = useState(60);
  const [search, setSearch]       = useState("");
  const [region, setRegion]       = useState<"ALL"|"FR"|"CZ">("ALL");

  useEffect(() => { loadAll(); }, [days, region]);

  async function loadAll() {
    setLoading(true);
    const [poolRes, featuredRes] = await Promise.all([
      fetch(`/api/admin/matches-pool?days=${days}`),
      fetch(`/api/admin/featured-matches?region=${region}`),
    ]);
    if (poolRes.ok)     setPool(await poolRes.json());
    if (featuredRes.ok) setFeatured(await featuredRes.json());
    setLoading(false);
  }

  function addMatch(matchId: string, cat: Omit<FeaturedMatch, "matchId">) {
    setFeatured((prev) => {
      if (prev.find((x) => x.matchId === matchId)) return prev;
      return [...prev, { ...cat, matchId }];
    });
    setSaved(false);
  }

  function setMatchCategory(matchId: string, fm: FeaturedMatch | null) {
    setFeatured((prev) => {
      const without = prev.filter((x) => x.matchId !== matchId);
      if (!fm) return without;
      return [...without, { ...fm, matchId }];
    });
    setSaved(false);
  }

  function removeMatch(matchId: string) {
    setFeatured((prev) => prev.filter((x) => x.matchId !== matchId));
    setSaved(false);
  }

  function reorderMatch(matchId: string, dir: "up" | "down") {
    setFeatured((prev) => {
      const idx = prev.findIndex((f) => f.matchId === matchId);
      if (idx < 0) return prev;
      const swapWith = dir === "up" ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
      return next;
    });
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/admin/featured-matches?region=${region}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(featured),
    });
    if (res.ok) setSaved(true);
    setSaving(false);
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return pool;
    return pool.filter((m) =>
      m.player1.toLowerCase().includes(q) || m.player2.toLowerCase().includes(q)
    );
  }, [pool, search]);

  const featuredSet = useMemo(() => new Set(featured.map((f) => f.matchId)), [featured]);
  const featuredMap = useMemo(() => new Map(featured.map((f) => [f.matchId, f])), [featured]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem", alignItems: "start", maxWidth: 1100 }}>
      {/* ── Left: picker ── */}
      <div>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 2 }}>
            Zajímavé zápasy
          </h1>
          <p style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", marginBottom: "0.75rem" }}>
            Zaškrtněte zápasy a přiřaďte kategorii. Bez výběru se zobrazí automaticky vybrané.
          </p>
          <div style={{ display: "flex", gap: 6 }}>
            {REGIONS.map(r => (
              <button key={r.value} onClick={() => { setRegion(r.value); setSaved(false); }} style={{
                padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer",
                border: "1px solid", fontFamily: "var(--font-mono)",
                borderColor: region === r.value ? greenBorder : "hsl(var(--border))",
                background: region === r.value ? greenBg : "transparent",
                color: region === r.value ? green : "hsl(var(--muted-foreground))",
              }}>{r.label}</button>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {!loading && pool.length > 0 && (
          <RecommendedSection pool={pool} featured={featured} onAdd={addMatch} />
        )}

        {/* Controls bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem",
          padding: "10px 14px", background: "hsl(var(--card)/0.6)",
          border: "1px solid hsl(var(--border))", borderRadius: 10, flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", fontWeight: 600, flexShrink: 0 }}>Za:</span>
          {[30, 60, 90].map((d) => (
            <button key={d} onClick={() => setDays(d)} style={{
              padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
              border: "1px solid", fontFamily: "var(--font-mono)",
              borderColor: days === d ? greenBorder : "hsl(var(--border))",
              background: days === d ? greenBg : "transparent",
              color: days === d ? green : "hsl(var(--muted-foreground))",
            }}>{d}d</button>
          ))}
          <div style={{ flex: 1, position: "relative", minWidth: 140 }}>
            <Search size={12} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "hsl(var(--muted-foreground))", pointerEvents: "none" }} />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Hledat hráče…"
              style={{
                width: "100%", padding: "5px 28px", borderRadius: 7, fontSize: 12,
                background: "hsl(var(--muted)/0.5)", border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))", fontFamily: "var(--font-body)", outline: "none",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "hsl(var(--muted-foreground))", padding: 0 }}>
                <X size={11} />
              </button>
            )}
          </div>
          <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", flexShrink: 0 }}>{featured.length} vybráno</span>
        </div>

        {/* Match list */}
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "hsl(var(--muted-foreground))", fontSize: 13 }}>
            <RefreshCw size={16} style={{ display: "inline", marginRight: 8, opacity: 0.5 }} /> Načítám…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", background: "hsl(var(--card)/0.5)", borderRadius: 10, border: "1px dashed hsl(var(--border))", color: "hsl(var(--muted-foreground))", fontSize: 13 }}>
            {search ? `Žádné zápasy odpovídající „${search}"` : `Žádné zápasy za posledních ${days} dní.`}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.map((m) => {
              const fm = featuredMap.get(m.matchId) ?? null;
              const checked = featuredSet.has(m.matchId);
              return (
                <div key={m.matchId} style={{
                  padding: "10px 14px",
                  background: checked ? "hsl(var(--card)/0.9)" : "hsl(var(--card)/0.45)",
                  border: `1px solid ${checked ? greenBorder : "hsl(var(--border))"}`,
                  borderRadius: 10, transition: "border-color .15s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: checked ? 8 : 0 }}>
                    <div
                      onClick={() => setMatchCategory(m.matchId, checked ? null : { matchId: m.matchId, category: "high-elo", categoryLabel: "Nejvyšší ELO", categoryEmoji: "⭐" })}
                      style={{
                        width: 17, height: 17, borderRadius: 5, flexShrink: 0, cursor: "pointer",
                        background: checked ? green : "hsl(var(--muted)/0.5)",
                        border: `2px solid ${checked ? green : "hsl(var(--border))"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                      {checked && <span style={{ color: "#000", fontSize: 10, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--foreground))" }}>
                        <span style={{ color: resultColor(m.result1) }}>{m.player1}</span>
                        <span style={{ color: "hsl(var(--muted-foreground))", fontWeight: 400, margin: "0 6px" }}>vs</span>
                        <span style={{ color: resultColor(m.result2) }}>{m.player2}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", marginTop: 1 }}>
                        {m.date} · {m.elo1} vs {m.elo2} · Δ {Math.round(m.eloDiff)} · ⌀ {Math.round(m.avgElo)}
                      </div>
                    </div>
                  </div>
                  {checked && (
                    <div style={{ paddingLeft: 27 }}>
                      <CategoryPicker
                        value={fm}
                        onChange={(val) => setMatchCategory(m.matchId, val)}
                        matchId={m.matchId}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Right: preview ── */}
      <PreviewPanel
        featured={featured}
        pool={pool}
        onRemove={removeMatch}
        onReorder={reorderMatch}
        onSave={save}
        saving={saving}
        saved={saved}
      />
    </div>
  );
}
