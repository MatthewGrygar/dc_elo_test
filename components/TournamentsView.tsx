"use client";

import { useState, useEffect, useMemo } from "react";
import { useRatingMode } from "./RatingModeProvider";
import { Search, ChevronDown, RefreshCw, X } from "lucide-react";

interface TournamentGame {
  matchId: string; date: string;
  player1: string; elo1Before: number; elo1After: number; delta1: number; result1: "Won" | "Lost" | "Draw";
  player2: string; elo2Before: number; elo2After: number; delta2: number; result2: "Won" | "Lost" | "Draw";
}

interface Tournament {
  name: string; type: string; date: string; gameCount: number;
  games: TournamentGame[];
}

function resultColor(r: "Won" | "Lost" | "Draw") {
  if (r === "Won") return "hsl(142,65%,50%)";
  if (r === "Lost") return "hsl(0,65%,55%)";
  return "hsl(42,80%,55%)";
}

function resultBadge(r: "Won" | "Lost" | "Draw") {
  const color = resultColor(r);
  const label = r === "Won" ? "W" : r === "Lost" ? "L" : "D";
  return (
    <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 5px", borderRadius: 4, background: `${color}20`, color, border: `1px solid ${color}40`, fontFamily: "var(--font-mono)" }}>
      {label}
    </span>
  );
}

function deltaChip(d: number) {
  const color = d > 0 ? "hsl(142,65%,50%)" : d < 0 ? "hsl(0,65%,55%)" : "hsl(var(--muted-foreground))";
  return <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600, color }}>{d > 0 ? `+${d}` : d}</span>;
}

function GlassCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", ...style }}>
      <div style={{ position: "absolute", inset: 0, background: "hsl(var(--card)/0.88)", backdropFilter: "blur(18px)", border: "1px solid hsl(var(--card-border)/0.85)", borderRadius: 14 }} />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

export default function TournamentsView() {
  const { mode } = useRatingMode();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    setTournaments([]);
    fetch(`/api/tournaments?mode=${mode}`)
      .then(r => r.json())
      .then(d => setTournaments(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mode]);

  const filtered = useMemo(() => {
    if (!search.trim()) return tournaments;
    const q = search.toLowerCase();
    return tournaments.filter(t => t.name.toLowerCase().includes(q));
  }, [tournaments, search]);

  function toggleExpand(name: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }} className="scrollbar-thin">
      {/* Header */}
      <div style={{ flexShrink: 0, marginBottom: 12 }}>
        <div style={{ position: "relative" }}>
          <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "hsl(var(--muted-foreground))", pointerEvents: "none" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Hledat turnaj…"
            style={{
              width: "100%", padding: "9px 32px 9px 34px", borderRadius: 10, fontSize: 13, boxSizing: "border-box",
              background: "hsl(var(--card)/0.7)", border: "1px solid hsl(var(--border))",
              color: "hsl(var(--foreground))", fontFamily: "var(--font-body)", outline: "none",
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "hsl(var(--muted-foreground))", padding: 0 }}>
              <X size={12} />
            </button>
          )}
        </div>
        {!loading && (
          <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", marginTop: 6, letterSpacing: "0.06em" }}>
            {filtered.length} turnajů · {mode}
          </div>
        )}
      </div>

      {/* Tournament list */}
      <div style={{ flex: 1, overflowY: "auto" }} className="scrollbar-thin">
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem", gap: 10, color: "hsl(var(--muted-foreground))", fontSize: 13 }}>
            <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Načítám turnaje…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "hsl(var(--muted-foreground))", fontSize: 13 }}>
            {search ? `Žádné turnaje odpovídající „${search}"` : "Žádná data."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.map(t => {
              const isOpen = expanded.has(t.name);
              return (
                <GlassCard key={t.name}>
                  {/* Tournament header row */}
                  <button
                    onClick={() => toggleExpand(t.name)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 14px", background: "none", border: "none", cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--foreground))", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.name}
                      </div>
                      <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", marginTop: 2, display: "flex", gap: 8 }}>
                        <span>{t.date}</span>
                        {t.type && t.type !== "FNM" && <span style={{ padding: "0 5px", borderRadius: 3, background: "hsl(var(--muted)/0.5)", fontSize: 9 }}>{t.type}</span>}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", flexShrink: 0 }}>
                      {t.gameCount} {t.gameCount === 1 ? "hra" : t.gameCount < 5 ? "hry" : "her"}
                    </span>
                    <ChevronDown size={14} style={{ color: "hsl(var(--muted-foreground))", flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                  </button>

                  {/* Games list */}
                  {isOpen && (
                    <div style={{ borderTop: "1px solid hsl(var(--border)/0.5)" }}>
                      {t.games.map((g, gi) => (
                        <div key={g.matchId} style={{
                          padding: "7px 14px",
                          borderBottom: gi < t.games.length - 1 ? "1px solid hsl(var(--border)/0.25)" : "none",
                          display: "flex", alignItems: "center", gap: 8,
                        }}>
                          {/* Date */}
                          <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", flexShrink: 0, minWidth: 62 }}>{g.date}</span>

                          {/* Player 1 */}
                          <div style={{ flex: 1, minWidth: 0, textAlign: "right" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: resultColor(g.result1), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.player1}</div>
                            <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))" }}>
                              {g.elo1Before} → {g.elo1After} {deltaChip(g.delta1)}
                            </div>
                          </div>

                          {/* Result badges */}
                          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                            {resultBadge(g.result1)}
                            <span style={{ fontSize: 8, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>vs</span>
                            {resultBadge(g.result2)}
                          </div>

                          {/* Player 2 */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: resultColor(g.result2), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.player2}</div>
                            <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))" }}>
                              {g.elo2Before} → {g.elo2After} {deltaChip(g.delta2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
      <style jsx global>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
