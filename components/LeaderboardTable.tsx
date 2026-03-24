"use client";

import { useEffect, useState } from "react";
import { useRatingMode } from "./RatingModeProvider";
import { useAppNav } from "./AppContext";
import { Player } from "@/lib/sheets";
import { avatarInitials } from "@/lib/utils";
import { t } from "@/lib/i18n";
import {
  ChevronUp, ChevronDown, Trophy, Activity,
  Swords, TrendingUp, TrendingDown, X, BarChart2,
} from "lucide-react";
import type { PrefetchCache } from "@/app/page";

type SortKey = "id" | "rating" | "games" | "win" | "loss" | "draw" | "peak" | "winrate";

const VT_META = {
  VT1: { label: "Class A", color: "hsl(152,72%,45%)", bg: "hsl(152 72% 45% / .12)", border: "hsl(152 72% 45% / .3)" },
  VT2: { label: "Class B", color: "hsl(42,92%,52%)",  bg: "hsl(42 92% 52% / .12)",  border: "hsl(42 92% 52% / .3)"  },
  VT3: { label: "Class C", color: "hsl(24,88%,56%)",  bg: "hsl(24 88% 56% / .12)",  border: "hsl(24 88% 56% / .3)"  },
  VT4: { label: "Class D", color: "hsl(0,70%,58%)",   bg: "hsl(0 70% 58% / .12)",   border: "hsl(0 70% 58% / .3)"   },
} as const;

function GlassPanel({ children, style, accent, className }: {
  children: React.ReactNode; style?: React.CSSProperties; accent?: boolean; className?: string;
}) {
  return (
    <div className={className} style={{ position: "relative", borderRadius: 16, overflow: "hidden", ...style }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "hsl(var(--card) / 0.82)",
        backdropFilter: "blur(16px) saturate(150%)",
        WebkitBackdropFilter: "blur(16px) saturate(150%)",
        border: `1px solid ${accent ? "hsl(var(--primary) / 0.32)" : "hsl(var(--card-border) / 0.85)"}`,
        borderRadius: 16,
      }} />
      {accent && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, hsl(var(--primary)), transparent 70%)" }} />}
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>{children}</div>
    </div>
  );
}

// ── Mini player card shown below table when player row is clicked ──────────────
function PlayerMiniCard({ player, onClose, onOpen }: {
  player: Player; onClose: () => void; onOpen: (p: Player) => void;
}) {
  const wr = player.winrate <= 1 ? player.winrate * 100 : player.winrate;
  const green = "hsl(152,72%,50%)";
  const red   = "hsl(0,68%,56%)";
  const amber = "hsl(42,90%,52%)";
  const vtClass = (player as any).vtClass as keyof typeof VT_META | undefined;

  const stats = [
    { label: "Rating",     value: player.rating.toLocaleString("cs-CZ"), color: "hsl(var(--primary))" },
    { label: "Peak",       value: player.peak.toLocaleString("cs-CZ"),   color: amber },
    { label: "Zápasy",     value: player.games.toString(),               color: "hsl(var(--foreground))" },
    { label: "Výhry",      value: player.win.toString(),                 color: green },
    { label: "Prohry",     value: player.loss.toString(),                color: red   },
    { label: "Remízy",     value: player.draw.toString(),                color: amber },
    { label: "Winrate",    value: wr.toFixed(1) + "%",                   color: wr >= 55 ? green : wr >= 45 ? amber : red },
  ];

  return (
    <div className="anim-slide-up" style={{ position: "relative", borderRadius: 14, overflow: "hidden", flexShrink: 0 }}>
      {/* Glass bg */}
      <div style={{
        position: "absolute", inset: 0,
        background: "hsl(var(--card) / 0.90)",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        border: "1px solid hsl(var(--primary) / 0.28)",
        borderRadius: 14,
      }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, hsl(var(--primary)), transparent 70%)" }} />

      <div style={{ position: "relative", zIndex: 1, padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          {/* Avatar */}
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: "hsl(var(--primary) / 0.18)",
            border: "1.5px solid hsl(var(--primary) / 0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17, fontWeight: 800, color: "hsl(var(--primary))",
            fontFamily: "var(--font-display)",
          }}>
            {avatarInitials(player.name)}
          </div>

          {/* Name + rank */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 3 }}>
              {player.name}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>
                Rank #{player.id}
              </span>
              {vtClass && VT_META[vtClass] && (
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 4,
                  background: VT_META[vtClass].bg, color: VT_META[vtClass].color,
                  border: `1px solid ${VT_META[vtClass].border}`, fontFamily: "var(--font-mono)",
                }}>{VT_META[vtClass].label}</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => onOpen(player)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 9,
                background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))",
                border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
                fontFamily: "var(--font-body)",
                boxShadow: "0 3px 12px hsl(var(--primary) / 0.35)",
              }}
            >
              <Activity size={12} />
              Detail hráče
            </button>
            <button
              onClick={onClose}
              style={{
                width: 30, height: 30, borderRadius: 8,
                background: "hsl(var(--muted) / 0.5)", border: "1px solid hsl(var(--border))",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "hsl(var(--muted-foreground))", cursor: "pointer",
              }}
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 8,
        }}>
          {stats.map(({ label, value, color }) => (
            <div key={label} style={{
              padding: "8px 10px", borderRadius: 9,
              background: "hsl(var(--muted) / 0.4)",
              border: "1px solid hsl(var(--border) / 0.5)",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--font-mono)", color, letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* ELO bar — visual representation */}
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase" }}>ELO pozice</span>
            <span style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>
              {wr.toFixed(1)}% winrate · {player.games} zápasů
            </span>
          </div>
          <div style={{ height: 5, background: "hsl(var(--border) / 0.5)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${Math.min(100, Math.max(5, ((player.rating - 800) / (2400 - 800)) * 100))}%`,
              background: `linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))`,
              borderRadius: 99,
              transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
            <span style={{ fontSize: 8, color: "hsl(var(--muted-foreground) / 0.7)", fontFamily: "var(--font-mono)" }}>800</span>
            <span style={{ fontSize: 8, color: "hsl(var(--muted-foreground) / 0.7)", fontFamily: "var(--font-mono)" }}>2400</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LeaderboardTable({ prefetchCache }: { prefetchCache?: PrefetchCache }) {
  const { mode } = useRatingMode();
  const { openPlayer, navigateTo, lang } = useAppNav();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("rating");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedCard, setSelectedCard] = useState<Player | null>(null);

  useEffect(() => {
    const c = prefetchCache?.[mode]?.players;
    if (c) { setPlayers(c); setLoading(false); return; }
    setLoading(true);
    fetch(`/api/players?mode=${mode}`)
      .then(r => r.json())
      .then(d => { setPlayers(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [mode, prefetchCache]);

  const handleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("desc"); }
  };

  const sorted = [...players].sort((a, b) => {
    const av = a[sortKey as keyof Player] as number, bv = b[sortKey as keyof Player] as number;
    return (av < bv ? -1 : av > bv ? 1 : 0) * (sortDir === "asc" ? 1 : -1);
  });

  function SI({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronUp size={10} style={{ opacity: 0.25 }} />;
    return sortDir === "desc"
      ? <ChevronDown size={10} style={{ color: "hsl(var(--primary))" }} />
      : <ChevronUp size={10} style={{ color: "hsl(var(--primary))" }} />;
  }

  const thS = (right?: boolean): React.CSSProperties => ({
    padding: "10px 14px", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap",
    textAlign: right ? "right" : "left", fontSize: 9,
    fontFamily: "var(--font-mono)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
    borderBottom: "1px solid hsl(var(--border) / 0.6)",
    background: "hsl(var(--card) / 0.97)",
    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    position: "sticky", top: 0, zIndex: 5,
  });

  if (loading) return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="skeleton" style={{ height: 32, borderRadius: 8, width: 200 }} />
      <div style={{ flex: 1, borderRadius: 16, overflow: "hidden", border: "1px solid hsl(var(--border))" }}>
        {[...Array(10)].map((_, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "11px 14px", borderBottom: "1px solid hsl(var(--border)/0.4)" }}>
            <div className="skeleton" style={{ width: 26, height: 26, borderRadius: 6 }} />
            <div className="skeleton" style={{ width: 30, height: 30, borderRadius: 7 }} />
            <div className="skeleton" style={{ flex: 1, height: 14, borderRadius: 4 }} />
            <div className="skeleton" style={{ width: 60, height: 14, borderRadius: 4 }} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Header */}
      <div className="anim-slide-up s1" style={{ flexShrink: 0 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 2 }}>
          {t(lang, "leaderboard")}
        </h2>
        <p style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
          {t(lang, "sub_leaderboard")} · {players.length} {lang === "en" ? "players" : lang === "fr" ? "joueurs" : "hráčů"}
        </p>
      </div>

      {/* Table */}
      <GlassPanel style={{ flex: 1, minHeight: 0 }} className="anim-slide-up s2">
        <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th onClick={() => handleSort("id")} style={{ ...thS(), color: sortKey === "id" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>#<SI col="id" /></span>
                </th>
                <th onClick={() => handleSort("id")} style={{ ...thS(), color: "hsl(var(--muted-foreground))" }}>{t(lang, "player_name")}</th>
                <th onClick={() => handleSort("rating")} style={{ ...thS(true), color: sortKey === "rating" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>{t(lang, "rating")}<SI col="rating" /></span>
                </th>
                <th onClick={() => handleSort("games")} style={{ ...thS(true), color: sortKey === "games" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>{t(lang, "games")}<SI col="games" /></span>
                </th>
                <th onClick={() => handleSort("win")} style={{ ...thS(true), color: sortKey === "win" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>W<SI col="win" /></span>
                </th>
                <th onClick={() => handleSort("loss")} style={{ ...thS(true), color: sortKey === "loss" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>L<SI col="loss" /></span>
                </th>
                <th onClick={() => handleSort("draw")} style={{ ...thS(true), color: sortKey === "draw" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>D<SI col="draw" /></span>
                </th>
                <th onClick={() => handleSort("winrate")} style={{ ...thS(true), color: sortKey === "winrate" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>{t(lang, "winrate")}<SI col="winrate" /></span>
                </th>
                <th onClick={() => handleSort("peak")} style={{ ...thS(true), color: sortKey === "peak" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>{t(lang, "peak")}<SI col="peak" /></span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => {
                const origRank = players.findIndex(x => x.id === p.id) + 1;
                const wr = p.winrate <= 1 ? p.winrate * 100 : p.winrate;
                const wrColor = wr >= 55 ? "hsl(var(--primary))" : wr >= 45 ? "hsl(42,92%,52%)" : "hsl(0,70%,58%)";
                const medals = ["🥇", "🥈", "🥉"];
                const vtClass = (p as any).vtClass as keyof typeof VT_META | undefined;
                const isSelected = selectedCard?.id === p.id;
                const rankColors = [
                  { color: "hsl(42,92%,52%)", bg: "hsl(42 92% 52% / .12)", border: "hsl(42 92% 52% / .3)" },
                  { color: "hsl(220,14%,65%)", bg: "hsl(220 14% 65% / .12)", border: "hsl(220 14% 65% / .3)" },
                  { color: "hsl(28,72%,52%)", bg: "hsl(28 72% 52% / .12)", border: "hsl(28 72% 52% / .3)" },
                ];
                const td: React.CSSProperties = {
                  padding: "9px 14px",
                  borderBottom: "1px solid hsl(var(--border) / 0.3)",
                  verticalAlign: "middle",
                  whiteSpace: "nowrap",
                  background: isSelected ? "hsl(var(--primary) / 0.07)" : "transparent",
                };
                return (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedCard(isSelected ? null : p)}
                    style={{ cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.querySelectorAll("td").forEach((td: any) => { td.style.background = "hsl(var(--primary) / 0.04)"; }); }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.querySelectorAll("td").forEach((td: any) => { td.style.background = "transparent"; }); }}
                  >
                    <td style={td}>
                      {origRank <= 3 ? (
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 7, fontSize: 13, background: rankColors[origRank - 1].bg, border: `1px solid ${rankColors[origRank - 1].border}` }}>
                          {medals[origRank - 1]}
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 7, fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", background: "hsl(var(--muted) / 0.5)" }}>
                          {origRank}
                        </span>
                      )}
                    </td>
                    <td style={td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: isSelected ? "hsl(var(--primary) / 0.25)" : "hsl(var(--primary) / 0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "hsl(var(--primary))", fontFamily: "var(--font-display)" }}>
                          {avatarInitials(p.name)}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</span>
                        {vtClass && VT_META[vtClass] && (
                          <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: VT_META[vtClass].bg, color: VT_META[vtClass].color, border: `1px solid ${VT_META[vtClass].border}`, fontFamily: "var(--font-mono)" }}>
                            {VT_META[vtClass].label}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ ...td, textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 700, color: "hsl(var(--primary))", fontSize: 13 }}>
                      {p.rating.toLocaleString("cs-CZ")}
                    </td>
                    <td style={{ ...td, textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 12, color: "hsl(var(--muted-foreground))" }}>{p.games}</td>
                    <td style={{ ...td, textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 12, color: "hsl(var(--primary))", fontWeight: 600 }}>{p.win}</td>
                    <td style={{ ...td, textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 12, color: "hsl(0,68%,58%)", fontWeight: 600 }}>{p.loss}</td>
                    <td style={{ ...td, textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 12, color: "hsl(42,90%,52%)", fontWeight: 600 }}>{p.draw}</td>
                    <td style={{ ...td, textAlign: "right" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)", color: wrColor }}>{wr.toFixed(1)}%</span>
                    </td>
                    <td style={{ ...td, textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                      {p.peak.toLocaleString("cs-CZ")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassPanel>

      {/* Player mini-card */}
      {selectedCard && (
        <PlayerMiniCard
          player={selectedCard}
          onClose={() => setSelectedCard(null)}
          onOpen={(p) => { openPlayer(p); setSelectedCard(null); }}
        />
      )}
    </div>
  );
}
