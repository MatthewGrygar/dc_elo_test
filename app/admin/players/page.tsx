"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Tag, Star, ExternalLink } from "lucide-react";

const green = "hsl(152,72%,45%)";
const greenBg = "hsl(152 72% 45% / 0.1)";
const greenBorder = "hsl(152 72% 45% / 0.28)";
const amber = "hsl(42,80%,52%)";
const amberBg = "hsl(42 80% 52% / 0.1)";
const amberBorder = "hsl(42 80% 52% / 0.28)";

const inputStyle: React.CSSProperties = {
  padding: "7px 10px", borderRadius: 7, fontSize: 13,
  background: "hsl(var(--muted)/0.4)", border: "1px solid hsl(var(--border))",
  color: "hsl(var(--foreground))", fontFamily: "var(--font-body)", outline: "none",
};

export default function PlayersPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<string[]>([]);
  const [taggedPlayers, setTaggedPlayers] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/players?all=1")
      .then(r => r.json())
      .then(d => { setPlayers(d.players ?? []); setTaggedPlayers(d.taggedPlayers ?? []); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = players.filter(p => p.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)", margin: 0 }}>
          Hráči
        </h1>
        <p style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", marginTop: 4 }}>
          Přidělte hráčům tagy, super tagy, tagy rekordů a Moxfield profil.
        </p>
      </div>

      <div style={{ maxWidth: 560 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Hledat hráče…"
          style={{ ...inputStyle, width: "100%", marginBottom: 12, boxSizing: "border-box" }}
        />

        {loading ? (
          <div style={{ color: "hsl(var(--muted-foreground))", fontSize: 13 }}>Načítám…</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {filtered.map(name => {
              const hasTag = taggedPlayers.includes(name);
              return (
                <button
                  key={name}
                  onClick={() => router.push(`/admin/players/${encodeURIComponent(name)}`)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 12px", borderRadius: 8, cursor: "pointer",
                    background: hasTag ? greenBg : "hsl(var(--card)/0.6)",
                    border: `1px solid ${hasTag ? greenBorder : "hsl(var(--border))"}`,
                    textAlign: "left", fontSize: 13, fontWeight: 500,
                    color: "hsl(var(--foreground))", transition: "background .12s",
                  }}
                >
                  {hasTag
                    ? <Tag size={14} color={green} style={{ flexShrink: 0 }} />
                    : <Users size={14} color="hsl(var(--muted-foreground))" style={{ flexShrink: 0 }} />
                  }
                  <span style={{ flex: 1 }}>{name}</span>
                  {hasTag && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4,
                      background: greenBg, color: green, border: `1px solid ${greenBorder}`,
                      fontFamily: "var(--font-mono)",
                    }}>tagováno</span>
                  )}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", padding: "12px 0" }}>
                Žádný hráč nenalezen.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
