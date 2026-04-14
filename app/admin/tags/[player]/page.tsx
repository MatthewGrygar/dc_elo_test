"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Star, Tag } from "lucide-react";

interface PlayerTag {
  id: string;
  label: string;
  color?: string;
  icon?: string;
  isSuper: boolean;
  createdAt: string;
}

const green = "hsl(152,72%,45%)";
const greenBg = "hsl(152 72% 45% / 0.1)";
const greenBorder = "hsl(152 72% 45% / 0.28)";
const amber = "hsl(42,80%,52%)";
const amberBg = "hsl(42 80% 52% / 0.1)";
const amberBorder = "hsl(42 80% 52% / 0.28)";
const red = "hsl(0,68%,56%)";

const PRESET_COLORS = [
  { label: "Zelená", value: "hsl(152,72%,45%)" },
  { label: "Zlatá", value: "hsl(42,92%,52%)" },
  { label: "Oranžová", value: "hsl(24,88%,56%)" },
  { label: "Červená", value: "hsl(0,70%,58%)" },
  { label: "Modrá", value: "hsl(210,80%,55%)" },
  { label: "Fialová", value: "hsl(265,65%,60%)" },
  { label: "Tyrkys", value: "hsl(185,75%,48%)" },
  { label: "Růžová", value: "hsl(340,70%,58%)" },
];

const PRESET_ICONS = ["⭐","🏆","🔥","⚡","🎯","👑","💎","🛡️","🚀","🎮","🌟","💪","🦁","🐉","🏅","🎖️"];

const inputStyle: React.CSSProperties = {
  padding: "7px 10px", borderRadius: 7, fontSize: 13,
  background: "hsl(var(--muted)/0.4)", border: "1px solid hsl(var(--border))",
  color: "hsl(var(--foreground))", fontFamily: "var(--font-body)", outline: "none",
};

function TagBadge({ tag, onDelete }: { tag: PlayerTag; onDelete: () => void }) {
  const color = tag.color ?? green;
  const bg = `${color}22`;
  const border = `${color}55`;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 7,
      padding: "8px 12px", borderRadius: 9,
      background: "hsl(var(--card)/0.8)", border: `1px solid hsl(var(--border))`,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 5,
        padding: "3px 9px", borderRadius: 6,
        background: bg, border: `1px solid ${border}`,
      }}>
        {tag.icon && <span style={{ fontSize: 13 }}>{tag.icon}</span>}
        <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "var(--font-mono)" }}>{tag.label}</span>
        {tag.isSuper && <Star size={10} color={amber} fill={amber} style={{ marginLeft: 2 }} />}
      </div>
      {tag.isSuper && (
        <span style={{
          fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 4,
          background: amberBg, color: amber, border: `1px solid ${amberBorder}`,
          fontFamily: "var(--font-mono)",
        }}>SUPER</span>
      )}
      <button
        onClick={onDelete}
        style={{
          marginLeft: "auto", width: 22, height: 22, borderRadius: 5,
          border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          background: "hsl(var(--destructive)/0.12)", color: red, fontSize: 10,
        }}
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

export default function PlayerTagsPage({ params }: { params: Promise<{ player: string }> }) {
  const { player: encodedPlayer } = use(params);
  const playerName = decodeURIComponent(encodedPlayer);
  const router = useRouter();

  const [tags, setTags] = useState<PlayerTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  // Form state
  const [label, setLabel] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0].value);
  const [icon, setIcon] = useState("");
  const [isSuper, setIsSuper] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/tags?player=${encodeURIComponent(playerName)}`)
      .then(r => r.json())
      .then(setTags)
      .finally(() => setLoading(false));
  }, [playerName]);

  async function handleAdd() {
    if (!label.trim()) { setError("Vyplňte název tagu."); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName, tag: { label: label.trim(), color, icon: icon || undefined, isSuper } }),
      });
      const newTag = await res.json();
      setTags(prev => [...prev, newTag]);
      setLabel(""); setIcon(""); setIsSuper(false); setAdding(false);
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(tagId: string) {
    setDeleting(tagId);
    try {
      await fetch(`/api/admin/tags?player=${encodeURIComponent(playerName)}&id=${tagId}`, { method: "DELETE" });
      setTags(prev => prev.filter(t => t.id !== tagId));
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => router.push("/admin/tags")}
          style={{
            display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7,
            border: "1px solid hsl(var(--border))", background: "none", cursor: "pointer",
            fontSize: 12, color: "hsl(var(--muted-foreground))",
          }}
        >
          <ArrowLeft size={13} /> Zpět
        </button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, fontFamily: "var(--font-display)", margin: 0 }}>
            {playerName}
          </h1>
          <p style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", margin: "2px 0 0" }}>
            Tagy hráče
          </p>
        </div>
      </div>

      {/* Existing tags */}
      <div style={{ maxWidth: 560, marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--muted-foreground))", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Přiřazené tagy ({tags.length})
        </div>
        {loading ? (
          <div style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>Načítám…</div>
        ) : tags.length === 0 ? (
          <div style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", fontStyle: "italic" }}>
            Žádné tagy zatím nejsou přiřazeny.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {tags.map(tag => (
              <TagBadge
                key={tag.id}
                tag={tag}
                onDelete={() => deleting !== tag.id && handleDelete(tag.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add tag */}
      <div style={{ maxWidth: 560 }}>
        {!adding ? (
          <button
            onClick={() => setAdding(true)}
            style={{
              display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 8,
              border: `1px solid ${greenBorder}`, background: greenBg, cursor: "pointer",
              fontSize: 13, fontWeight: 600, color: green,
            }}
          >
            <Plus size={14} /> Přidat tag
          </button>
        ) : (
          <div style={{
            padding: "16px", borderRadius: 10,
            border: "1px solid hsl(var(--border))", background: "hsl(var(--card)/0.7)",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Nový tag</div>

            {/* Label */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", display: "block", marginBottom: 4 }}>
                Název tagu *
              </label>
              <input
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="např. Legenda, MVP, Veterán…"
                style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
              />
            </div>

            {/* Icon */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", display: "block", marginBottom: 4 }}>
                Ikona (volitelné)
              </label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                {PRESET_ICONS.map(ic => (
                  <button key={ic} onClick={() => setIcon(ic === icon ? "" : ic)} style={{
                    width: 30, height: 30, borderRadius: 6, border: `1px solid ${icon === ic ? greenBorder : "hsl(var(--border))"}`,
                    background: icon === ic ? greenBg : "hsl(var(--muted)/0.3)", cursor: "pointer", fontSize: 15,
                  }}>{ic}</button>
                ))}
              </div>
              <input
                value={icon}
                onChange={e => setIcon(e.target.value)}
                placeholder="nebo zadejte emoji ručně…"
                style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
              />
            </div>

            {/* Color */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", display: "block", marginBottom: 4 }}>
                Barva
              </label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {PRESET_COLORS.map(c => (
                  <button key={c.value} onClick={() => setColor(c.value)} title={c.label} style={{
                    width: 26, height: 26, borderRadius: "50%", border: `2px solid ${color === c.value ? "hsl(var(--foreground))" : "transparent"}`,
                    background: c.value, cursor: "pointer", flexShrink: 0,
                  }} />
                ))}
              </div>
            </div>

            {/* Preview */}
            {label && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", display: "block", marginBottom: 4 }}>
                  Náhled
                </label>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 6, background: `${color}22`, border: `1px solid ${color}55` }}>
                  {icon && <span style={{ fontSize: 13 }}>{icon}</span>}
                  <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "var(--font-mono)" }}>{label}</span>
                  {isSuper && <Star size={10} color={amber} fill={amber} />}
                </div>
              </div>
            )}

            {/* Super tag toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, padding: "10px 12px", borderRadius: 8, background: isSuper ? amberBg : "hsl(var(--muted)/0.2)", border: `1px solid ${isSuper ? amberBorder : "hsl(var(--border))"}` }}>
              <input
                type="checkbox"
                id="isSuper"
                checked={isSuper}
                onChange={e => setIsSuper(e.target.checked)}
                style={{ accentColor: amber, width: 15, height: 15, cursor: "pointer" }}
              />
              <label htmlFor="isSuper" style={{ cursor: "pointer", flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: isSuper ? amber : "hsl(var(--foreground))" }}>
                  Super tag
                </div>
                <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", marginTop: 1 }}>
                  Zobrazí se přímo vedle jména hráče v žebříčku (místo Class nebo vedle ní)
                </div>
              </label>
              <Star size={16} color={amber} fill={isSuper ? amber : "none"} />
            </div>

            {error && <div style={{ fontSize: 12, color: red, marginBottom: 8 }}>{error}</div>}

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleAdd}
                disabled={saving}
                style={{
                  padding: "7px 16px", borderRadius: 7, border: "none", cursor: saving ? "not-allowed" : "pointer",
                  background: saving ? "hsl(var(--muted))" : green, color: "#fff", fontSize: 13, fontWeight: 600,
                }}
              >
                {saving ? "Ukládám…" : "Přidat"}
              </button>
              <button
                onClick={() => { setAdding(false); setError(""); setLabel(""); setIcon(""); setIsSuper(false); }}
                style={{
                  padding: "7px 12px", borderRadius: 7, border: "1px solid hsl(var(--border))",
                  background: "none", cursor: "pointer", fontSize: 13, color: "hsl(var(--muted-foreground))",
                }}
              >
                Zrušit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
