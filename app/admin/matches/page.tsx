"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw } from "lucide-react";

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

function resultColor(result: string) {
  if (result?.toLowerCase().startsWith("won") || result?.toLowerCase().includes("výh")) return "hsl(152,72%,45%)";
  if (result?.toLowerCase().startsWith("lost") || result?.toLowerCase().includes("proh")) return "hsl(0,72%,60%)";
  return "hsl(var(--muted-foreground))";
}

export default function MatchesPage() {
  const [pool, setPool] = useState<Match[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [days, setDays] = useState(60);

  useEffect(() => { loadAll(); }, [days]);

  async function loadAll() {
    setLoading(true);
    const [poolRes, featuredRes] = await Promise.all([
      fetch(`/api/admin/matches-pool?days=${days}`),
      fetch("/api/admin/featured-matches"),
    ]);
    if (poolRes.ok) setPool(await poolRes.json());
    if (featuredRes.ok) {
      const ids: string[] = await featuredRes.json();
      setSelected(new Set(ids));
    }
    setLoading(false);
  }

  function toggle(matchId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(matchId)) next.delete(matchId);
      else next.add(matchId);
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

  return (
    <div style={{ maxWidth: 920 }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 2 }}>
          Zajímavé zápasy
        </h1>
        <p style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
          Zaškrtněte zápasy, které se zobrazí v sekci <strong>Zajímavé zápasy</strong> na hlavní stránce.
          Pokud nic nevyberete, zobrazí se automaticky vybrané zápasy.
        </p>
      </div>

      {/* Controls */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, marginBottom: "1.25rem",
        padding: "12px 16px",
        background: "hsl(var(--card)/0.6)", border: "1px solid hsl(var(--border))", borderRadius: 10,
      }}>
        <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", fontWeight: 600 }}>
          Zobrazit zápasy za:
        </span>
        {[30, 60, 90].map((d) => (
          <button key={d} onClick={() => setDays(d)} style={{
            padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer",
            border: "1px solid", fontFamily: "var(--font-mono)",
            borderColor: days === d ? greenBorder : "hsl(var(--border))",
            background: days === d ? greenBg : "transparent",
            color: days === d ? green : "hsl(var(--muted-foreground))",
          }}>{d} dní</button>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
          {selected.size} vybráno
        </span>
        <button onClick={save} disabled={saving} style={{
          display: "flex", alignItems: "center", gap: 7, padding: "8px 16px",
          background: saving ? greenBg : saved ? "hsl(var(--card))" : green,
          color: saving || saved ? green : "#000",
          border: `1px solid ${greenBorder}`, borderRadius: 8,
          fontWeight: 700, fontSize: 12, cursor: saving ? "not-allowed" : "pointer",
          fontFamily: "var(--font-body)", transition: "all .15s",
        }}>
          <Save size={13} /> {saving ? "Ukládám…" : saved ? "Uloženo ✓" : "Uložit výběr"}
        </button>
      </div>

      {/* Match list */}
      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "hsl(var(--muted-foreground))", fontSize: 13 }}>
          <RefreshCw size={18} style={{ display: "inline", marginRight: 8, opacity: 0.5 }} />
          Načítám zápasy…
        </div>
      ) : pool.length === 0 ? (
        <div style={{
          padding: "3rem", textAlign: "center",
          background: "hsl(var(--card)/0.5)", borderRadius: 12, border: "1px dashed hsl(var(--border))",
          color: "hsl(var(--muted-foreground))", fontSize: 13,
        }}>
          Žádné zápasy za posledních {days} dní.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {pool.map((m) => {
            const checked = selected.has(m.matchId);
            return (
              <label key={m.matchId} style={{
                display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
                padding: "12px 16px",
                background: checked ? "hsl(var(--card)/0.9)" : "hsl(var(--card)/0.5)",
                border: `1px solid ${checked ? greenBorder : "hsl(var(--border))"}`,
                borderRadius: 10, transition: "all .15s",
              }}>
                {/* Checkbox */}
                <div style={{
                  width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                  background: checked ? green : "hsl(var(--muted)/0.5)",
                  border: `2px solid ${checked ? green : "hsl(var(--border))"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all .15s",
                }}>
                  {checked && <span style={{ color: "#000", fontSize: 11, fontWeight: 900 }}>✓</span>}
                </div>
                <input type="checkbox" checked={checked} onChange={() => toggle(m.matchId)} style={{ display: "none" }} />

                {/* Player 1 */}
                <div style={{ flex: 1, minWidth: 0, textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--foreground))", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.player1}
                  </div>
                  <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>
                    ELO {m.elo1} · <span style={{ color: resultColor(m.result1) }}>{m.result1}</span>
                  </div>
                </div>

                {/* VS badge */}
                <div style={{
                  padding: "4px 10px", borderRadius: 7, fontSize: 10, fontWeight: 800,
                  fontFamily: "var(--font-mono)", letterSpacing: "0.1em",
                  background: "hsl(var(--muted)/0.5)", color: "hsl(var(--muted-foreground))",
                  flexShrink: 0,
                }}>VS</div>

                {/* Player 2 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--foreground))", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.player2}
                  </div>
                  <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>
                    ELO {m.elo2} · <span style={{ color: resultColor(m.result2) }}>{m.result2}</span>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", marginBottom: 2 }}>
                    ⌀ ELO {Math.round(m.avgElo)}
                  </div>
                  <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>
                    Δ {Math.round(m.eloDiff)} · {m.date}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
