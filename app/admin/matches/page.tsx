"use client";

import { useState, useEffect, useMemo } from "react";
import { Save, RefreshCw, Search, X } from "lucide-react";

interface Match {
  matchId: string;
  player1: string;
  elo1: number;
  result1: string;
  player2: string;
  elo2: number;
  result2: string;
  avgElo: number;
  eloDiff: number;
  date: string;
}

const green = "hsl(152,72%,45%)";
const greenBg = "hsl(152 72% 45% / 0.1)";
const greenBorder = "hsl(152 72% 45% / 0.28)";

function resultColor(r: string) {
  const s = r?.toLowerCase() ?? "";
  if (s.startsWith("won") || s.includes("výh")) return green;
  if (s.startsWith("lost") || s.includes("proh")) return "hsl(0,72%,60%)";
  return "hsl(var(--muted-foreground))";
}

// ── Dashboard preview card (matches how DashboardView renders it) ─────────────
function MatchPreviewCard({ match, accent }: { match: Match; accent: string }) {
  const winner = match.result1?.toLowerCase().startsWith("won") ? match.player1 : match.player2;
  const loser  = match.result1?.toLowerCase().startsWith("won") ? match.player2 : match.player1;
  const winnerElo = match.result1?.toLowerCase().startsWith("won") ? match.elo1 : match.elo2;
  const loserElo  = match.result1?.toLowerCase().startsWith("won") ? match.elo2 : match.elo1;

  return (
    <div style={{
      borderRadius: 12, overflow: "hidden",
      background: "hsl(var(--card)/0.8)",
      border: `1px solid ${accent}44`,
      position: "relative",
    }}>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${accent}, transparent)` }} />
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <span style={{
            padding: "2px 8px", borderRadius: 99, fontSize: 9, fontWeight: 700,
            fontFamily: "var(--font-mono)", letterSpacing: "0.06em",
            background: `${accent}18`, border: `1px solid ${accent}44`, color: accent,
          }}>ZAJÍMAVÝ ZÁPAS</span>
          <span style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", marginLeft: "auto" }}>{match.date}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--foreground))" }}>{match.player1}</div>
            <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))" }}>ELO {match.elo1}</div>
          </div>
          <div style={{
            padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 800,
            background: "hsl(var(--muted)/0.5)", color: "hsl(var(--muted-foreground))",
            fontFamily: "var(--font-mono)",
          }}>VS</div>
          <div style={{ flex: 1, textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--foreground))" }}>{match.player2}</div>
            <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))" }}>ELO {match.elo2}</div>
          </div>
        </div>

        <div style={{
          padding: "8px 10px", borderRadius: 8,
          background: `${accent}0d`, border: `1px solid ${accent}28`,
          fontSize: 11, color: "hsl(var(--muted-foreground))",
          display: "flex", gap: 12,
        }}>
          <span>🏆 <strong style={{ color: "hsl(var(--foreground))" }}>{winner}</strong> ({winnerElo})</span>
          <span style={{ marginLeft: "auto" }}>Δ ELO {Math.round(match.eloDiff)}</span>
          <span>⌀ {Math.round(match.avgElo)}</span>
        </div>
      </div>
    </div>
  );
}

export default function MatchesPage() {
  const [pool, setPool]       = useState<Match[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [days, setDays]       = useState(60);
  const [search, setSearch]   = useState("");

  useEffect(() => { loadAll(); }, [days]);

  async function loadAll() {
    setLoading(true);
    const [poolRes, featuredRes] = await Promise.all([
      fetch(`/api/admin/matches-pool?days=${days}`),
      fetch("/api/admin/featured-matches"),
    ]);
    if (poolRes.ok) setPool(await poolRes.json());
    if (featuredRes.ok) setSelected(new Set(await featuredRes.json()));
    setLoading(false);
  }

  function toggle(matchId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(matchId) ? next.delete(matchId) : next.add(matchId);
      return next;
    });
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    const res = await fetch("/api/admin/featured-matches", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([...selected]),
    });
    if (res.ok) setSaved(true);
    setSaving(false);
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return pool;
    return pool.filter(
      (m) => m.player1.toLowerCase().includes(q) || m.player2.toLowerCase().includes(q)
    );
  }, [pool, search]);

  const previewMatches = useMemo(
    () => pool.filter((m) => selected.has(m.matchId)),
    [pool, selected]
  );

  return (
    <div style={{ maxWidth: 1100, display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem", alignItems: "start" }}>
      {/* ── Left: picker ── */}
      <div>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 2 }}>
            Zajímavé zápasy
          </h1>
          <p style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
            Zaškrtněte zápasy, které se zobrazí v sekci <strong>Zajímavé zápasy</strong> na hlavní stránce.
            Bez výběru se zobrazí automaticky vybrané.
          </p>
        </div>

        {/* Controls */}
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

          {/* Search */}
          <div style={{ flex: 1, position: "relative", minWidth: 140 }}>
            <Search size={12} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "hsl(var(--muted-foreground))", pointerEvents: "none" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Hledat hráče…"
              style={{
                width: "100%", padding: "5px 28px 5px 28px", borderRadius: 7, fontSize: 12,
                background: "hsl(var(--muted)/0.5)", border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))", fontFamily: "var(--font-body)", outline: "none",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{
                position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "hsl(var(--muted-foreground))", padding: 0,
              }}><X size={11} /></button>
            )}
          </div>

          <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", flexShrink: 0 }}>
            {selected.size} vybráno
          </span>
          <button onClick={save} disabled={saving} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
            background: saving ? greenBg : saved ? "hsl(var(--card))" : green,
            color: saving || saved ? green : "#000",
            border: `1px solid ${greenBorder}`, borderRadius: 7,
            fontWeight: 700, fontSize: 12, cursor: saving ? "not-allowed" : "pointer",
            fontFamily: "var(--font-body)",
          }}>
            <Save size={12} /> {saving ? "Ukládám…" : saved ? "Uloženo ✓" : "Uložit"}
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "hsl(var(--muted-foreground))", fontSize: 13 }}>
            <RefreshCw size={16} style={{ display: "inline", marginRight: 8, opacity: 0.5 }} /> Načítám…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", background: "hsl(var(--card)/0.5)", borderRadius: 10, border: "1px dashed hsl(var(--border))", color: "hsl(var(--muted-foreground))", fontSize: 13 }}>
            {search ? `Žádné zápasy odpovídající „${search}"` : `Žádné zápasy za posledních ${days} dní.`}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {filtered.map((m) => {
              const checked = selected.has(m.matchId);
              return (
                <label key={m.matchId} style={{
                  display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                  padding: "10px 14px",
                  background: checked ? "hsl(var(--card)/0.9)" : "hsl(var(--card)/0.45)",
                  border: `1px solid ${checked ? greenBorder : "hsl(var(--border))"}`,
                  borderRadius: 9, transition: "all .15s",
                }}>
                  <div style={{
                    width: 17, height: 17, borderRadius: 5, flexShrink: 0,
                    background: checked ? green : "hsl(var(--muted)/0.5)",
                    border: `2px solid ${checked ? green : "hsl(var(--border))"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {checked && <span style={{ color: "#000", fontSize: 10, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                  </div>
                  <input type="checkbox" checked={checked} onChange={() => toggle(m.matchId)} style={{ display: "none" }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--foreground))" }}>
                      <span style={{ color: resultColor(m.result1) }}>{m.player1}</span>
                      <span style={{ color: "hsl(var(--muted-foreground))", fontWeight: 400, margin: "0 6px" }}>vs</span>
                      <span style={{ color: resultColor(m.result2) }}>{m.player2}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", marginTop: 2 }}>
                      {m.date} · ELO {m.elo1} vs {m.elo2} · Δ {Math.round(m.eloDiff)} · ⌀ {Math.round(m.avgElo)}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Right: preview ── */}
      <div style={{ position: "sticky", top: "1.5rem" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(var(--muted-foreground))", marginBottom: "0.75rem" }}>
          Náhled na hlavní stránce
        </div>
        <div style={{
          background: "hsl(var(--card)/0.5)", border: "1px solid hsl(var(--border))",
          borderRadius: 12, padding: "1rem",
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "hsl(var(--foreground))", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: 6 }}>
            <span>⚡</span> Zajímavé zápasy
          </div>
          {previewMatches.length === 0 ? (
            <div style={{
              padding: "1.5rem 1rem", textAlign: "center", borderRadius: 8,
              background: "hsl(var(--muted)/0.3)", border: "1px dashed hsl(var(--border))",
              fontSize: 11, color: "hsl(var(--muted-foreground))",
            }}>
              Žádný vybraný zápas.<br />Zobrazí se automaticky vybrané.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {previewMatches.slice(0, 4).map((m, i) => (
                <MatchPreviewCard
                  key={m.matchId}
                  match={m}
                  accent={i % 2 === 0 ? "hsl(152,72%,45%)" : "hsl(42,80%,52%)"}
                />
              ))}
              {previewMatches.length > 4 && (
                <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", textAlign: "center", padding: "4px" }}>
                  + {previewMatches.length - 4} dalších
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
