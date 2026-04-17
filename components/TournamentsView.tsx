"use client";

import { useState, useEffect, useMemo } from "react";
import { useRatingMode } from "./RatingModeProvider";
import { Search, RefreshCw, X, Trophy, Users, Zap, TrendingUp, TrendingDown } from "lucide-react";

interface TournamentGame {
  matchId: string; date: string;
  player1: string; elo1Before: number; elo1After: number; delta1: number; result1: "Won" | "Lost" | "Draw";
  player2: string; elo2Before: number; elo2After: number; delta2: number; result2: "Won" | "Lost" | "Draw";
}

interface Tournament {
  name: string; type: string; date: string; gameCount: number;
  games: TournamentGame[];
}

interface PlayerStanding {
  name: string; wins: number; losses: number; draws: number; games: number;
  netDelta: number; eloStart: number; eloEnd: number;
}

const green = "hsl(142,65%,50%)";
const red   = "hsl(0,65%,55%)";
const amber = "hsl(42,80%,55%)";

function resultColor(r: "Won" | "Lost" | "Draw") {
  if (r === "Won") return green;
  if (r === "Lost") return red;
  return amber;
}

function DeltaBadge({ d }: { d: number }) {
  const color = d > 0 ? green : d < 0 ? red : "hsl(var(--muted-foreground))";
  return (
    <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 700, color }}>
      {d > 0 ? `+${d}` : d}
    </span>
  );
}

function ResultPip({ r }: { r: "Won" | "Lost" | "Draw" }) {
  const color = resultColor(r);
  const label = r === "Won" ? "W" : r === "Lost" ? "L" : "D";
  return (
    <span style={{
      fontSize: 8, fontWeight: 800, padding: "1px 4px", borderRadius: 3,
      background: `${color}1a`, color, border: `1px solid ${color}40`,
      fontFamily: "var(--font-mono)", lineHeight: 1,
    }}>{label}</span>
  );
}

function StatTile({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color?: string }) {
  return (
    <div style={{
      flex: 1, minWidth: 0, padding: "10px 12px", borderRadius: 10,
      background: "hsl(var(--muted)/0.3)", border: "1px solid hsl(var(--border)/0.6)",
      display: "flex", flexDirection: "column", gap: 4,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <Icon size={11} style={{ color: color ?? "hsl(var(--muted-foreground))", flexShrink: 0 }} />
        <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>{label}</span>
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--font-mono)", color: color ?? "hsl(var(--foreground))", lineHeight: 1, letterSpacing: "-0.02em" }}>{value}</div>
    </div>
  );
}

function computeStandings(games: TournamentGame[]): PlayerStanding[] {
  const map = new Map<string, PlayerStanding>();

  function ensure(name: string, eloStart: number) {
    if (!map.has(name)) map.set(name, { name, wins: 0, losses: 0, draws: 0, games: 0, netDelta: 0, eloStart, eloEnd: eloStart });
  }

  for (const g of games) {
    ensure(g.player1, g.elo1Before);
    ensure(g.player2, g.elo2Before);
    const p1 = map.get(g.player1)!;
    const p2 = map.get(g.player2)!;
    p1.games++; p1.netDelta += g.delta1; p1.eloEnd = g.elo1After;
    p2.games++; p2.netDelta += g.delta2; p2.eloEnd = g.elo2After;
    if (g.result1 === "Won")       { p1.wins++;   p2.losses++; }
    else if (g.result1 === "Lost") { p1.losses++; p2.wins++;   }
    else                           { p1.draws++;  p2.draws++;  }
  }

  return [...map.values()].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.netDelta - a.netDelta;
  });
}

// ── Detail panel ─────────────────────────────────────────────────────────────
function TournamentDetail({ t, mode }: { t: Tournament; mode: string }) {
  const standings = useMemo(() => computeStandings(t.games), [t]);

  const avgElo = useMemo(() => {
    const elos = t.games.flatMap(g => [g.elo1Before, g.elo2Before]).filter(e => e > 0);
    return elos.length ? Math.round(elos.reduce((a, b) => a + b, 0) / elos.length) : 0;
  }, [t]);

  const biggestGain = standings.reduce((best, p) => (!best || p.netDelta > best.netDelta) ? p : best, standings[0]);
  const biggestLoss = standings.reduce((best, p) => (!best || p.netDelta < best.netDelta) ? p : best, standings[0]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, height: "100%", overflowY: "auto" }} className="scrollbar-thin">
      {/* Tournament header */}
      <div>
        <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-display)", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 4 }}>{t.name}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))" }}>{t.date}</span>
          <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", padding: "1px 6px", borderRadius: 4, background: "hsl(var(--primary)/0.12)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary)/0.28)", fontWeight: 700 }}>{mode}</span>
          {t.type && t.type !== "FNM" && (
            <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: "hsl(var(--muted)/0.5)", color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{t.type}</span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 6 }}>
        <StatTile icon={Zap}   label="Her"     value={String(t.gameCount)} color="hsl(var(--primary))" />
        <StatTile icon={Users} label="Hráčů"   value={String(standings.length)} color={amber} />
        <StatTile icon={Trophy} label="Avg ELO" value={String(avgElo)} color={green} />
      </div>

      {/* Best / worst gain */}
      {standings.length > 0 && (
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ flex: 1, padding: "8px 12px", borderRadius: 10, background: `${green}12`, border: `1px solid ${green}30` }}>
            <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: green, letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 3 }}>
              <TrendingUp size={9} style={{ display: "inline", marginRight: 3 }} />Nejlepší zisk
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "hsl(var(--foreground))", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{biggestGain?.name}</div>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: green }}>{biggestGain?.netDelta > 0 ? `+${biggestGain.netDelta}` : biggestGain?.netDelta}</div>
          </div>
          <div style={{ flex: 1, padding: "8px 12px", borderRadius: 10, background: `${red}12`, border: `1px solid ${red}30` }}>
            <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: red, letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 3 }}>
              <TrendingDown size={9} style={{ display: "inline", marginRight: 3 }} />Největší ztráta
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "hsl(var(--foreground))", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{biggestLoss?.name}</div>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: red }}>{biggestLoss?.netDelta > 0 ? `+${biggestLoss.netDelta}` : biggestLoss?.netDelta}</div>
          </div>
        </div>
      )}

      {/* Standings table */}
      <div>
        <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "hsl(var(--muted-foreground))", marginBottom: 6 }}>Pořadí hráčů</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {standings.map((p, i) => (
            <div key={p.name} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "7px 10px", borderRadius: 8,
              background: i === 0 ? `${amber}12` : "hsl(var(--muted)/0.2)",
              border: `1px solid ${i === 0 ? `${amber}30` : "hsl(var(--border)/0.4)"}`,
            }}>
              {/* Rank */}
              <div style={{
                width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 800, fontFamily: "var(--font-mono)",
                background: i === 0 ? amber : i === 1 ? "hsl(var(--muted-foreground)/0.3)" : "hsl(var(--muted)/0.4)",
                color: i === 0 ? "#000" : "hsl(var(--muted-foreground))",
              }}>{i + 1}</div>
              {/* Name */}
              <div style={{ flex: 1, minWidth: 0, fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "hsl(var(--foreground))" }}>
                {p.name}
              </div>
              {/* W/L/D */}
              <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 700, color: green }}>{p.wins}W</span>
                <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))"  }}>·</span>
                <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 700, color: red   }}>{p.losses}L</span>
                {p.draws > 0 && <>
                  <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))" }}>·</span>
                  <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 700, color: amber }}>{p.draws}D</span>
                </>}
              </div>
              {/* Net delta */}
              <DeltaBadge d={p.netDelta} />
            </div>
          ))}
        </div>
      </div>

      {/* Games list */}
      <div>
        <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "hsl(var(--muted-foreground))", marginBottom: 6 }}>Zápasy</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {t.games.map((g, gi) => (
            <div key={g.matchId} style={{
              padding: "6px 10px", borderRadius: 8,
              background: "hsl(var(--muted)/0.2)", border: "1px solid hsl(var(--border)/0.35)",
              display: "grid", gridTemplateColumns: "52px 1fr auto 1fr", gap: 8, alignItems: "center",
            }}>
              <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))" }}>{g.date}</span>
              <div style={{ minWidth: 0, textAlign: "right" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: resultColor(g.result1), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.player1}</div>
                <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))" }}>{g.elo1Before}→{g.elo1After} <DeltaBadge d={g.delta1} /></div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, flexShrink: 0 }}>
                <ResultPip r={g.result1} />
                <ResultPip r={g.result2} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: resultColor(g.result2), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.player2}</div>
                <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))" }}>{g.elo2Before}→{g.elo2After} <DeltaBadge d={g.delta2} /></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyDetail() {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
      <div style={{ width: 52, height: 52, borderRadius: 16, background: "hsl(var(--primary)/0.08)", border: "1px solid hsl(var(--primary)/0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Trophy size={22} style={{ color: "hsl(var(--primary)/0.4)" }} />
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--muted-foreground))", marginBottom: 4 }}>Vyberte turnaj</div>
        <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground)/0.6)", fontFamily: "var(--font-mono)" }}>Klikněte na turnaj vlevo pro zobrazení detailů</div>
      </div>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────
export default function TournamentsView() {
  const { mode } = useRatingMode();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Tournament | null>(null);

  useEffect(() => {
    setLoading(true);
    setTournaments([]);
    setSelected(null);
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

  return (
    <div style={{ height: "100%", display: "flex", gap: 12, overflow: "hidden" }}>

      {/* ── Left: tournament list (2/3) ── */}
      <div style={{ flex: 2, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Search bar */}
        <div style={{ flexShrink: 0, marginBottom: 10 }}>
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "hsl(var(--muted-foreground))", pointerEvents: "none" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Hledat turnaj…"
              style={{
                width: "100%", padding: "8px 30px 8px 32px", borderRadius: 10, fontSize: 13, boxSizing: "border-box",
                background: "hsl(var(--card)/0.7)", border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))", fontFamily: "var(--font-body)", outline: "none",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "hsl(var(--muted-foreground))", padding: 0 }}>
                <X size={12} />
              </button>
            )}
          </div>
          {!loading && (
            <div style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", marginTop: 5, letterSpacing: "0.06em" }}>
              {filtered.length} turnajů · {mode}
            </div>
          )}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto" }} className="scrollbar-thin">
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem", gap: 10, color: "hsl(var(--muted-foreground))", fontSize: 13 }}>
              <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Načítám…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "hsl(var(--muted-foreground))", fontSize: 13 }}>
              {search ? `Žádné turnaje odpovídající „${search}"` : "Žádná data."}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {filtered.map(t => {
                const isActive = selected?.name === t.name;
                return (
                  <button
                    key={t.name}
                    onClick={() => setSelected(t)}
                    style={{
                      width: "100%", textAlign: "left", cursor: "pointer",
                      padding: "9px 12px", borderRadius: 10,
                      background: isActive ? "hsl(var(--primary)/0.1)" : "hsl(var(--card)/0.6)",
                      border: `1px solid ${isActive ? "hsl(var(--primary)/0.35)" : "hsl(var(--border)/0.7)"}`,
                      transition: "background .12s, border-color .12s",
                      display: "flex", alignItems: "center", gap: 10,
                    }}
                  >
                    {/* Active indicator */}
                    <div style={{ width: 3, height: 32, borderRadius: 2, flexShrink: 0, background: isActive ? "hsl(var(--primary))" : "transparent", transition: "background .12s" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: isActive ? "hsl(var(--primary))" : "hsl(var(--foreground))", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", transition: "color .12s" }}>
                        {t.name}
                      </div>
                      <div style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                        {t.date}
                        {t.type && t.type !== "FNM" && <span style={{ marginLeft: 6, padding: "0 4px", borderRadius: 3, background: "hsl(var(--muted)/0.5)" }}>{t.type}</span>}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", flexShrink: 0 }}>
                      {t.gameCount}×
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: detail panel (1/3) ── */}
      <div style={{
        flex: 1, minWidth: 0,
        background: "hsl(var(--card)/0.5)",
        border: "1px solid hsl(var(--border)/0.7)",
        borderRadius: 14, padding: "14px 14px",
        overflow: "hidden", display: "flex", flexDirection: "column",
      }}>
        {selected ? (
          <TournamentDetail t={selected} mode={mode} />
        ) : (
          <EmptyDetail />
        )}
      </div>

      <style jsx global>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
