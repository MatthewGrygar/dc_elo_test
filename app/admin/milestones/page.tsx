"use client";

import { useState, useEffect, FormEvent } from "react";
import { Plus, Trash2, Eye, EyeOff, RefreshCw, ArrowDownToLine } from "lucide-react";

interface Milestone {
  id: string;
  icon: string;
  text: string;
  date: string;
  cat: string;
  visible: boolean;
  createdAt: string;
}

interface AutoMilestone {
  icon: string;
  text: string;
  date: string;
  cat: string;
}

const green = "hsl(152,72%,45%)";
const greenBg = "hsl(152 72% 45% / 0.1)";
const greenBorder = "hsl(152 72% 45% / 0.28)";
const yellow = "hsl(42,80%,52%)";
const yellowBg = "hsl(42 80% 52% / 0.1)";
const yellowBorder = "hsl(42 80% 52% / 0.28)";

const CATS = ["Žebříček", "ELO", "DCPR", "Turnaj", "Série", "Upset", "Komunita", "Jiné"];
const ICONS = ["🏆", "📈", "📉", "⚡", "🔥", "🎯", "🥇", "🎉", "📌", "⭐", "🚀", "💡"];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 13,
  background: "hsl(var(--muted)/0.4)", border: "1px solid hsl(var(--border))",
  color: "hsl(var(--foreground))", fontFamily: "var(--font-body)", outline: "none",
};

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [autoMs, setAutoMs]         = useState<AutoMilestone[]>([]);
  const [loading, setLoading]       = useState(true);
  const [autoLoading, setAutoLoading] = useState(true);
  const [saving, setSaving]         = useState<string | null>(null);
  const [adopting, setAdopting]     = useState<string | null>(null);

  // Form state
  const [icon, setIcon]       = useState("📌");
  const [text, setText]       = useState("");
  const [date, setDate]       = useState(new Date().toISOString().slice(0, 10));
  const [cat, setCat]         = useState("Jiné");
  const [visible, setVisible] = useState(true);
  const [adding, setAdding]   = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => { loadCustom(); loadAuto(); }, []);

  async function loadCustom() {
    setLoading(true);
    const res = await fetch("/api/admin/milestones");
    if (res.ok) setMilestones(await res.json());
    setLoading(false);
  }

  async function loadAuto() {
    setAutoLoading(true);
    const res = await fetch("/api/admin/auto-milestones");
    if (res.ok) setAutoMs(await res.json());
    setAutoLoading(false);
  }

  async function toggleVisible(m: Milestone) {
    setSaving(m.id);
    const res = await fetch(`/api/admin/milestones/${m.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...m, visible: !m.visible }),
    });
    if (res.ok) {
      const updated = await res.json();
      setMilestones((prev) => prev.map((x) => (x.id === m.id ? updated : x)));
    }
    setSaving(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Smazat tento milník?")) return;
    setSaving(id);
    const res = await fetch(`/api/admin/milestones/${id}`, { method: "DELETE" });
    if (res.ok) setMilestones((prev) => prev.filter((m) => m.id !== id));
    setSaving(null);
  }

  /** Copy auto-generated milestone into custom milestones */
  async function adoptAuto(a: AutoMilestone) {
    const key = a.text;
    setAdopting(key);
    const res = await fetch("/api/admin/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ icon: a.icon, text: a.text, date: a.date, cat: a.cat, visible: true }),
    });
    if (res.ok) {
      const ms = await res.json();
      setMilestones((prev) => [ms, ...prev]);
    }
    setAdopting(null);
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) { setError("Text milníku je povinný."); return; }
    setAdding(true); setError("");
    const res = await fetch("/api/admin/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ icon, text, date, cat, visible }),
    });
    if (res.ok) {
      const ms = await res.json();
      setMilestones((prev) => [ms, ...prev]);
      setText(""); setIcon("📌");
    } else {
      setError("Chyba při vytváření milníku.");
    }
    setAdding(false);
  }

  const card: React.CSSProperties = {
    background: "hsl(var(--card)/0.7)", backdropFilter: "blur(12px)",
    border: "1px solid hsl(var(--border))", borderRadius: 14, padding: "1.25rem",
    marginBottom: "1.5rem",
  };

  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 2 }}>
          Milníky
        </h1>
        <p style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
          Aktivní vlastní milníky se zobrazují v sekci <strong>Milníky</strong> na hlavní stránce.
          Pokud nejsou žádné aktivní, zobrazí se automaticky generované.
        </p>
      </div>

      {/* ── Auto-generated section ── */}
      <div style={{ ...card, borderColor: yellowBorder, background: `${yellowBg}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: yellow }}>
            ⚡ Automaticky generované ELO systémem
          </div>
          <button onClick={loadAuto} disabled={autoLoading} style={{
            display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
            background: yellowBg, border: `1px solid ${yellowBorder}`,
            borderRadius: 7, fontSize: 11, color: yellow, cursor: "pointer",
            fontFamily: "var(--font-body)",
          }}>
            <RefreshCw size={11} style={{ animation: autoLoading ? "spin 1s linear infinite" : "none" }} />
            Obnovit
          </button>
        </div>

        {autoLoading ? (
          <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", padding: "0.5rem 0" }}>Načítám…</div>
        ) : autoMs.length === 0 ? (
          <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>Žádné automatické milníky.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {autoMs.map((m, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px",
                background: "hsl(var(--card)/0.6)",
                border: `1px solid ${yellowBorder}`,
                borderRadius: 9,
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{m.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "hsl(var(--foreground))" }}>{m.text}</div>
                  <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", marginTop: 1 }}>
                    {m.date} ·{" "}
                    <span style={{
                      padding: "1px 6px", borderRadius: 99, fontSize: 9, fontWeight: 700,
                      background: yellowBg, border: `1px solid ${yellowBorder}`, color: yellow,
                      fontFamily: "var(--font-mono)",
                    }}>{m.cat}</span>
                  </div>
                </div>
                <button
                  onClick={() => adoptAuto(m)}
                  disabled={adopting === m.text}
                  title="Převzít jako vlastní milník"
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "5px 10px", borderRadius: 7, flexShrink: 0,
                    background: greenBg, border: `1px solid ${greenBorder}`,
                    color: green, cursor: "pointer", fontSize: 11, fontWeight: 600,
                    fontFamily: "var(--font-body)",
                    opacity: adopting === m.text ? 0.5 : 1,
                  }}>
                  <ArrowDownToLine size={11} />
                  Převzít
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add custom form ── */}
      <div style={{ ...card, borderColor: greenBorder }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: "1rem", color: green }}>
          <Plus size={14} style={{ display: "inline", marginRight: 5 }} />
          Přidat vlastní milník
        </div>
        <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "hsl(var(--muted-foreground))", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Ikona
            </label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              {ICONS.map((ic) => (
                <button key={ic} type="button" onClick={() => setIcon(ic)} style={{
                  width: 34, height: 34, borderRadius: 7, fontSize: 17, cursor: "pointer",
                  border: `2px solid ${icon === ic ? green : "transparent"}`,
                  background: icon === ic ? greenBg : "hsl(var(--muted)/0.4)",
                }}>{ic}</button>
              ))}
              <input
                value={ICONS.includes(icon) ? "" : icon}
                onChange={(e) => setIcon(e.target.value || "📌")}
                placeholder="vlastní"
                style={{ ...inputStyle, width: 80 }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 130px 120px", gap: "0.75rem", alignItems: "end" }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "hsl(var(--muted-foreground))", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Text</label>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Popis události…" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "hsl(var(--muted-foreground))", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Datum</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "hsl(var(--muted-foreground))", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Kategorie</label>
              <select value={cat} onChange={(e) => setCat(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
              <div onClick={() => setVisible((v) => !v)} style={{
                width: 36, height: 20, borderRadius: 99,
                background: visible ? green : "hsl(var(--muted))",
                position: "relative", transition: "background .2s", cursor: "pointer",
              }}>
                <div style={{
                  width: 14, height: 14, borderRadius: "50%", background: "#fff",
                  position: "absolute", top: 3, left: visible ? 19 : 3, transition: "left .2s",
                }} />
              </div>
              <span style={{ color: "hsl(var(--muted-foreground))" }}>
                {visible ? "Aktivní" : "Neaktivní"}
              </span>
            </label>
            {error && <span style={{ fontSize: 12, color: "hsl(var(--destructive))" }}>{error}</span>}
            <button type="submit" disabled={adding} style={{
              marginLeft: "auto", display: "flex", alignItems: "center", gap: 7,
              padding: "8px 18px", background: adding ? greenBg : green, color: adding ? green : "#000",
              border: `1px solid ${greenBorder}`, borderRadius: 8,
              fontWeight: 700, fontSize: 13, cursor: adding ? "not-allowed" : "pointer",
              fontFamily: "var(--font-body)",
            }}>
              <Plus size={13} /> {adding ? "Přidávám…" : "Přidat"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Custom milestones list ── */}
      <div style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--foreground))", marginBottom: "0.75rem" }}>
        Vlastní milníky ({milestones.filter((m) => m.visible).length} aktivní)
      </div>

      {loading ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "hsl(var(--muted-foreground))", fontSize: 13 }}>Načítám…</div>
      ) : milestones.length === 0 ? (
        <div style={{
          padding: "2rem", textAlign: "center",
          background: "hsl(var(--card)/0.5)", borderRadius: 10,
          border: "1px dashed hsl(var(--border))",
          color: "hsl(var(--muted-foreground))", fontSize: 13,
        }}>
          Žádné vlastní milníky. Přidejte výše nebo převezměte z auto-generovaných.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {milestones.map((m) => (
            <div key={m.id} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "11px 14px",
              background: m.visible ? "hsl(var(--card)/0.8)" : "hsl(var(--muted)/0.25)",
              border: `1px solid ${m.visible ? greenBorder : "hsl(var(--border))"}`,
              borderRadius: 10, opacity: saving === m.id ? 0.6 : 1, transition: "all .2s",
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{m.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--foreground))", marginBottom: 2 }}>{m.text}</div>
                <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))" }}>
                  {m.date} ·{" "}
                  <span style={{
                    padding: "1px 6px", borderRadius: 99, fontSize: 9, fontWeight: 700,
                    background: greenBg, border: `1px solid ${greenBorder}`, color: green,
                    fontFamily: "var(--font-mono)",
                  }}>{m.cat}</span>
                </div>
              </div>
              <button onClick={() => toggleVisible(m)} title={m.visible ? "Skrýt" : "Zobrazit"} style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 32, height: 32, borderRadius: 8, cursor: "pointer",
                borderColor: m.visible ? greenBorder : "hsl(var(--border))",
                background: m.visible ? greenBg : "hsl(var(--muted)/0.4)",
                color: m.visible ? green : "hsl(var(--muted-foreground))",
                border: "1px solid",
              }}>
                {m.visible ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>
              <button onClick={() => handleDelete(m.id)} title="Smazat" style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 32, height: 32, borderRadius: 8, cursor: "pointer",
                background: "hsl(var(--destructive)/0.1)", border: "1px solid hsl(var(--destructive)/0.3)",
                color: "hsl(var(--destructive))",
              }}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
