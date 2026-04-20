"use client";

import { useState, useEffect, useMemo } from "react";
import { useRatingMode } from "./RatingModeProvider";
import { useRegion } from "./RegionProvider";
import { Search, RefreshCw, X, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from "lucide-react";

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
    <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 700, color, flexShrink: 0 }}>
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
      fontFamily: "var(--font-mono)", lineHeight: 1, flexShrink: 0,
    }}>{label}</span>
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
  return [...map.values()].sort((a, b) => b.wins !== a.wins ? b.wins - a.wins : b.netDelta - a.netDelta);
}

// ── Single game row — one line ────────────────────────────────────────────────
function GameRow({ g }: { g: TournamentGame }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", minWidth: 0 }}>
      {/* Player 1 — right-aligned, truncated */}
      <span style={{
        flex: 1, minWidth: 0, textAlign: "right",
        fontSize: 11, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        color: resultColor(g.result1),
      }}>{g.player1}</span>

      <ResultPip r={g.result1} />
      <DeltaBadge d={g.delta1} />

      <span style={{ fontSize: 9, color: "hsl(var(--muted-foreground)/0.4)", flexShrink: 0, fontFamily: "var(--font-mono)" }}>·</span>

      <DeltaBadge d={g.delta2} />
      <ResultPip r={g.result2} />

      {/* Player 2 — left-aligned, truncated */}
      <span style={{
        flex: 1, minWidth: 0, textAlign: "left",
        fontSize: 11, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        color: resultColor(g.result2),
      }}>{g.player2}</span>
    </div>
  );
}

// ── Stat panels row ───────────────────────────────────────────────────────────
function StatPanels({ gameCount, playerCount, avgElo }: { gameCount: number; playerCount: number; avgElo: number }) {
  const items = [
    { label: "Her",     value: String(gameCount),   color: "hsl(var(--primary))" },
    { label: "Hráčů",  value: String(playerCount),  color: amber },
    { label: "Avg ELO", value: String(avgElo),       color: green },
  ];
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {items.map(s => (
        <div key={s.label} style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 4, padding: "10px 8px", borderRadius: 10,
          background: `${s.color}10`, border: `1px solid ${s.color}28`,
        }}>
          <span style={{
            fontSize: 8, fontFamily: "var(--font-mono)", letterSpacing: "0.12em",
            textTransform: "uppercase" as const, color: "hsl(var(--muted-foreground))",
          }}>{s.label}</span>
          <span style={{
            fontSize: 22, fontWeight: 900, fontFamily: "var(--font-mono)",
            color: s.color, lineHeight: 1, letterSpacing: "-0.03em",
          }}>{s.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Best / worst gain cards ───────────────────────────────────────────────────
function GainCards({ biggestGain, biggestLoss }: { biggestGain: PlayerStanding; biggestLoss: PlayerStanding }) {
  if (biggestGain.name === biggestLoss.name) return null;
  return (
    <div style={{ display: "flex", gap: 6 }}>
      <div style={{ flex: 1, padding: "7px 10px", borderRadius: 9, background: `${green}10`, border: `1px solid ${green}28` }}>
        <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: green, letterSpacing: "0.07em", textTransform: "uppercase" as const, marginBottom: 3, display: "flex", alignItems: "center", gap: 3 }}>
          <TrendingUp size={8} />Nejlepší zisk
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "hsl(var(--foreground))" }}>{biggestGain.name}</div>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: green }}>{biggestGain.netDelta > 0 ? `+${biggestGain.netDelta}` : biggestGain.netDelta}</div>
      </div>
      <div style={{ flex: 1, padding: "7px 10px", borderRadius: 9, background: `${red}10`, border: `1px solid ${red}28` }}>
        <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: red, letterSpacing: "0.07em", textTransform: "uppercase" as const, marginBottom: 3, display: "flex", alignItems: "center", gap: 3 }}>
          <TrendingDown size={8} />Největší ztráta
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "hsl(var(--foreground))" }}>{biggestLoss.name}</div>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: red }}>{biggestLoss.netDelta > 0 ? `+${biggestLoss.netDelta}` : biggestLoss.netDelta}</div>
      </div>
    </div>
  );
}

// ── Games section (list + label) ──────────────────────────────────────────────
function GamesList({ games }: { games: TournamentGame[] }) {
  return (
    <div>
      <div style={{ padding: "0 12px 4px", fontSize: 9, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "hsl(var(--muted-foreground))" }}>
        Zápasy
      </div>
      {games.map((g, i) => (
        <div key={g.matchId}>
          {i > 0 && <div style={{ height: 1, background: "hsl(var(--border)/0.22)", margin: "0 12px" }} />}
          <GameRow g={g} />
        </div>
      ))}
    </div>
  );
}

// ── Standings table ───────────────────────────────────────────────────────────
function StandingsTable({ standings }: { standings: PlayerStanding[] }) {
  return (
    <div>
      <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "hsl(var(--muted-foreground))", marginBottom: 5 }}>Pořadí</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {standings.map((p, i) => (
          <div key={p.name} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 8px", borderRadius: 7,
            background: i === 0 ? `${amber}10` : "hsl(var(--muted)/0.18)",
            border: `1px solid ${i === 0 ? `${amber}28` : "hsl(var(--border)/0.35)"}`,
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: 5, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 800, fontFamily: "var(--font-mono)",
              background: i === 0 ? amber : "hsl(var(--muted)/0.4)",
              color: i === 0 ? "#000" : "hsl(var(--muted-foreground))",
            }}>{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0, fontSize: 11, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {p.name}
            </div>
            <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 700, color: green, flexShrink: 0 }}>{p.wins}W</span>
            <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", flexShrink: 0 }}>·</span>
            <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 700, color: red, flexShrink: 0 }}>{p.losses}L</span>
            <DeltaBadge d={p.netDelta} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Expanded detail ───────────────────────────────────────────────────────────
function TournamentDetail({ t, isMobile }: { t: Tournament; isMobile: boolean }) {
  const sortedGames = useMemo(() => [...t.games].sort((a, b) => a.matchId.localeCompare(b.matchId, undefined, { numeric: true })), [t]);
  const standings  = useMemo(() => computeStandings(t.games), [t]);
  const avgElo     = useMemo(() => {
    const elos = t.games.flatMap(g => [g.elo1Before, g.elo2Before]).filter(e => e > 0);
    return elos.length ? Math.round(elos.reduce((a, b) => a + b, 0) / elos.length) : 0;
  }, [t]);
  const biggestGain = standings.reduce((best, p) => (!best || p.netDelta > best.netDelta) ? p : best, standings[0]);
  const biggestLoss = standings.reduce((best, p) => (!best || p.netDelta < best.netDelta) ? p : best, standings[0]);

  // ── Mobile: stacked layout ────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ borderTop: "1px solid hsl(var(--border)/0.4)", background: "hsl(var(--muted)/0.08)", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
        <StatPanels gameCount={t.gameCount} playerCount={standings.length} avgElo={avgElo} />
        {standings.length > 1 && <GainCards biggestGain={biggestGain} biggestLoss={biggestLoss} />}
        <GamesList games={sortedGames} />
      </div>
    );
  }

  // ── Desktop: two-column layout ────────────────────────────────────────────
  return (
    <div style={{ display: "flex", gap: 0, borderTop: "1px solid hsl(var(--border)/0.4)", background: "hsl(var(--muted)/0.08)" }}>
      {/* Left: games */}
      <div style={{ flex: 3, minWidth: 0, borderRight: "1px solid hsl(var(--border)/0.35)", paddingBottom: 8 }}>
        <div style={{ height: 6 }} />
        <GamesList games={sortedGames} />
      </div>

      {/* Right: stats + gain cards + standings */}
      <div style={{ flex: 2, minWidth: 0, padding: "12px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
        <StatPanels gameCount={t.gameCount} playerCount={standings.length} avgElo={avgElo} />
        {standings.length > 1 && <GainCards biggestGain={biggestGain} biggestLoss={biggestLoss} />}
        <StandingsTable standings={standings} />
      </div>
    </div>
  );
}

// ── Accordion row ─────────────────────────────────────────────────────────────
function TournamentRow({ t, isOpen, onToggle, isMobile }: { t: Tournament; isOpen: boolean; onToggle: () => void; isMobile: boolean }) {
  return (
    <div style={{
      borderRadius: 10, overflow: "hidden",
      border: `1px solid ${isOpen ? "hsl(var(--primary)/0.35)" : "hsl(var(--border)/0.7)"}`,
      background: isOpen ? "hsl(var(--primary)/0.04)" : "hsl(var(--card)/0.6)",
      transition: "border-color .12s, background .12s",
    }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%", textAlign: "left", cursor: "pointer",
          padding: "9px 12px", background: "none", border: "none",
          display: "flex", alignItems: "center", gap: 10,
        }}
      >
        <div style={{ width: 3, height: 28, borderRadius: 2, flexShrink: 0, background: isOpen ? "hsl(var(--primary))" : "transparent", transition: "background .12s" }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: isOpen ? "hsl(var(--primary))" : "hsl(var(--foreground))", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", transition: "color .12s" }}>
            {t.name}
          </div>
          <div style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", marginTop: 2 }}>
            {t.date}
            {t.type && t.type !== "FNM" && (
              <span style={{ marginLeft: 6, padding: "0 4px", borderRadius: 3, background: "hsl(var(--muted)/0.5)" }}>{t.type}</span>
            )}
          </div>
        </div>
        <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", flexShrink: 0 }}>{t.gameCount}×</span>
        {isOpen
          ? <ChevronUp   size={13} style={{ color: "hsl(var(--primary))",          flexShrink: 0 }} />
          : <ChevronDown size={13} style={{ color: "hsl(var(--muted-foreground))", flexShrink: 0 }} />
        }
      </button>
      {isOpen && <TournamentDetail t={t} isMobile={isMobile} />}
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────
export default function TournamentsView() {
  const { mode } = useRatingMode();
  const { region } = useRegion();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [openName,    setOpenName]    = useState<string | null>(null);
  const [isMobile,    setIsMobile]    = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    setLoading(true);
    setTournaments([]);
    setOpenName(null);
    fetch(`/api/tournaments?mode=${mode}&region=${region}`)
      .then(r => r.json())
      .then(d => setTournaments(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mode, region]);

  const filtered = useMemo(() => {
    if (!search.trim()) return tournaments;
    const q = search.toLowerCase();
    return tournaments.filter(t => t.name.toLowerCase().includes(q));
  }, [tournaments, search]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
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
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {filtered.map(t => (
              <TournamentRow
                key={t.name}
                t={t}
                isOpen={openName === t.name}
                onToggle={() => setOpenName(prev => prev === t.name ? null : t.name)}
                isMobile={isMobile}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
