"use client";

import { useState, useEffect, FormEvent } from "react";
import { Plus, Trash2, Eye, EyeOff, RefreshCw, ArrowRight, X } from "lucide-react";

interface Milestone {
  id: string; icon: string; text: string; date: string; cat: string;
  visible: boolean; createdAt: string;
}
interface AutoMilestone { icon: string; text: string; date: string; cat: string; }

const green = "hsl(152,72%,45%)";
const greenBg = "hsl(152 72% 45% / 0.1)";
const greenBorder = "hsl(152 72% 45% / 0.28)";
const yellow = "hsl(42,80%,52%)";
const yellowBg = "hsl(42 80% 52% / 0.1)";
const yellowBorder = "hsl(42 80% 52% / 0.28)";

const CATS  = ["Žebříček","ELO","DCPR","Turnaj","Série","Upset","Komunita","Jiné"];
const ICONS = ["🏆","📈","📉","⚡","🔥","🎯","🥇","🎉","📌","⭐","🚀","💡"];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 11px", borderRadius: 7, fontSize: 13,
  background: "hsl(var(--muted)/0.4)", border: "1px solid hsl(var(--border))",
  color: "hsl(var(--foreground))", fontFamily: "var(--font-body)", outline: "none",
};

const MILESTONE_COLORS: Record<string,string> = {
  "Žebříček":"hsl(42,92%,52%)","ELO":"hsl(152,72%,50%)","Class":"hsl(195,78%,50%)",
  "Série":"hsl(0,72%,56%)","Upset":"hsl(24,88%,56%)","DCPR":"hsl(265,65%,60%)",
};

function PreviewMilestoneRow({ m, onRemove }: {
  m: { icon: string; text: string; date: string; cat: string };
  onRemove?: () => void;
}) {
  const col = MILESTONE_COLORS[m.cat] ?? "hsl(var(--primary))";
  const bg  = col.replace(")", " / .14)").replace("hsl(", "hsl(");
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 8,
      padding: "8px 10px", borderBottom: "1px solid hsl(var(--border)/0.3)",
      position: "relative",
    }}>
      <div style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, background: `${col}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
        {m.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingRight: onRemove ? 18 : 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.35, color: "hsl(var(--foreground))", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.text}</div>
        <div style={{ display: "flex", gap: 5, marginTop: 2, alignItems: "center" }}>
          <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: `${col}22`, color: col, fontFamily: "var(--font-mono)" }}>{m.cat}</span>
          <span style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{m.date}</span>
        </div>
      </div>
      {onRemove && (
        <button onClick={onRemove} style={{
          position: "absolute", top: 8, right: 8,
          width: 16, height: 16, borderRadius: 3, border: "none", cursor: "pointer",
          background: "hsl(var(--destructive)/0.15)", color: "hsl(var(--destructive))",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, padding: 0,
        }}>✕</button>
      )}
    </div>
  );
}

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [autoMs, setAutoMs]         = useState<AutoMilestone[]>([]);
  const [loading, setLoading]       = useState(true);
  const [autoLoading, setAutoLoading] = useState(true);
  const [saving, setSaving]         = useState<string | null>(null);
  const [adopting, setAdopting]     = useState<string | null>(null);

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
      method: "PUT", headers: { "Content-Type": "application/json" },
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

  async function adoptAuto(a: AutoMilestone) {
    setAdopting(a.text);
    const res = await fetch("/api/admin/milestones", {
      method: "POST", headers: { "Content-Type": "application/json" },
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
      method: "POST", headers: { "Content-Type": "application/json" },
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

  // What's currently shown on the main page
  const activeMilestones = milestones.filter((m) => m.visible);
  const previewMs: AutoMilestone[] = activeMilestones.length > 0
    ? activeMilestones
    : autoMs;

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 2 }}>Milníky</h1>
        <p style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
          Aktivní vlastní milníky se zobrazují na hlavní stránce. Bez aktivních vlastních se zobrazí automatické.
        </p>
      </div>

      {/* ── Two-column top section ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>
        {/* Left: auto-generated */}
        <div style={{
          background: yellowBg, border: `1px solid ${yellowBorder}`,
          borderRadius: 14, padding: "1.1rem", overflow: "hidden",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.9rem" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: yellow }}>⚡ Automaticky generované</div>
            <button onClick={loadAuto} disabled={autoLoading} style={{
              display: "flex", alignItems: "center", gap: 5, padding: "3px 9px",
              background: yellowBg, border: `1px solid ${yellowBorder}`,
              borderRadius: 6, fontSize: 11, color: yellow, cursor: "pointer", fontFamily: "var(--font-body)",
            }}>
              <RefreshCw size={10} style={{ animation: autoLoading ? "spin 1s linear infinite" : "none" }} /> Obnovit
            </button>
          </div>
          {autoLoading ? (
            <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>Načítám…</div>
          ) : autoMs.length === 0 ? (
            <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>Žádné automatické milníky.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {autoMs.map((m, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 10px", background: "hsl(var(--card)/0.6)",
                  border: `1px solid ${yellowBorder}`, borderRadius: 8,
                }}>
                  <span style={{ fontSize: 17, flexShrink: 0 }}>{m.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "hsl(var(--foreground))", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.text}</div>
                    <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", marginTop: 1 }}>
                      {m.date} · <span style={{ padding: "1px 5px", borderRadius: 99, fontSize: 8, fontWeight: 700, background: yellowBg, border: `1px solid ${yellowBorder}`, color: yellow, fontFamily: "var(--font-mono)" }}>{m.cat}</span>
                    </div>
                  </div>
                  <button onClick={() => adoptAuto(m)} disabled={adopting === m.text} title="Převzít jako vlastní" style={{
                    display: "flex", alignItems: "center", gap: 4, padding: "4px 9px",
                    background: greenBg, border: `1px solid ${greenBorder}`,
                    borderRadius: 6, color: green, cursor: "pointer", fontSize: 11, fontWeight: 600,
                    fontFamily: "var(--font-body)", flexShrink: 0,
                    opacity: adopting === m.text ? 0.5 : 1,
                  }}>
                    <ArrowRight size={10} /> Převzít
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: currently on main page */}
        <div style={{
          background: "hsl(var(--card)/0.6)", border: `1px solid ${greenBorder}`,
          borderRadius: 14, overflow: "hidden",
        }}>
          <div style={{ padding: "1.1rem 1.1rem 0.75rem", borderBottom: "1px solid hsl(var(--border))" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: green, marginBottom: 2 }}>
              ✓ Aktuálně na hlavní stránce
            </div>
            <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>
              {activeMilestones.length > 0
                ? `${activeMilestones.length} vlastní${activeMilestones.length > 1 ? "ch" : ""} milník${activeMilestones.length > 1 ? "ů" : ""}`
                : "Automaticky generované (žádné vlastní aktivní)"}
            </div>
          </div>
          <div style={{ overflowY: "auto", maxHeight: 300 }}>
            {previewMs.length === 0 ? (
              <div style={{ padding: "1.5rem", textAlign: "center", fontSize: 12, color: "hsl(var(--muted-foreground))" }}>Prázdné</div>
            ) : (
              previewMs.map((m, i) => {
                const custom = activeMilestones.find((x) => x.text === m.text);
                return (
                  <PreviewMilestoneRow
                    key={i}
                    m={m}
                    onRemove={custom ? () => toggleVisible(custom) : undefined}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Add form ── */}
      <div style={{
        background: "hsl(var(--card)/0.7)", border: `1px solid ${greenBorder}`,
        borderRadius: 14, padding: "1.1rem", marginBottom: "1.5rem",
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: green, marginBottom: "0.9rem" }}>
          <Plus size={13} style={{ display: "inline", marginRight: 5 }} />Přidat vlastní milník
        </div>
        <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            {ICONS.map((ic) => (
              <button key={ic} type="button" onClick={() => setIcon(ic)} style={{
                width: 32, height: 32, borderRadius: 7, fontSize: 17, cursor: "pointer",
                border: `2px solid ${icon === ic ? green : "transparent"}`,
                background: icon === ic ? greenBg : "hsl(var(--muted)/0.4)",
              }}>{ic}</button>
            ))}
            <input value={ICONS.includes(icon) ? "" : icon} onChange={(e) => setIcon(e.target.value || "📌")} placeholder="vlastní" style={{ ...inputStyle, width: 72, padding: "6px 8px" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 110px", gap: "0.6rem", alignItems: "end" }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: "hsl(var(--muted-foreground))", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Text</label>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Popis události…" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: "hsl(var(--muted-foreground))", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Datum</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: "hsl(var(--muted-foreground))", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Kategorie</label>
              <select value={cat} onChange={(e) => setCat(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
              <div onClick={() => setVisible((v) => !v)} style={{ width: 34, height: 19, borderRadius: 99, background: visible ? green : "hsl(var(--muted))", position: "relative", transition: "background .2s", cursor: "pointer" }}>
                <div style={{ width: 13, height: 13, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: visible ? 18 : 3, transition: "left .2s" }} />
              </div>
              <span style={{ color: "hsl(var(--muted-foreground))", fontSize: 12 }}>{visible ? "Aktivní" : "Neaktivní"}</span>
            </label>
            {error && <span style={{ fontSize: 12, color: "hsl(var(--destructive))" }}>{error}</span>}
            <button type="submit" disabled={adding} style={{
              marginLeft: "auto", display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", background: adding ? greenBg : green, color: adding ? green : "#000",
              border: `1px solid ${greenBorder}`, borderRadius: 8,
              fontWeight: 700, fontSize: 12, cursor: adding ? "not-allowed" : "pointer",
              fontFamily: "var(--font-body)",
            }}>
              <Plus size={13} /> {adding ? "Přidávám…" : "Přidat"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Custom milestone list ── */}
      <div style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--foreground))", marginBottom: "0.6rem" }}>
        Vlastní milníky ({activeMilestones.length} aktivní)
      </div>
      {loading ? (
        <div style={{ padding: "1.5rem", textAlign: "center", color: "hsl(var(--muted-foreground))", fontSize: 13 }}>Načítám…</div>
      ) : milestones.length === 0 ? (
        <div style={{ padding: "1.5rem", textAlign: "center", background: "hsl(var(--card)/0.5)", borderRadius: 10, border: "1px dashed hsl(var(--border))", color: "hsl(var(--muted-foreground))", fontSize: 13 }}>
          Žádné vlastní milníky.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {milestones.map((m) => (
            <div key={m.id} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              background: m.visible ? "hsl(var(--card)/0.8)" : "hsl(var(--muted)/0.2)",
              border: `1px solid ${m.visible ? greenBorder : "hsl(var(--border))"}`,
              borderRadius: 9, opacity: saving === m.id ? 0.6 : 1, transition: "all .2s",
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{m.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--foreground))", marginBottom: 1 }}>{m.text}</div>
                <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))" }}>
                  {m.date} · <span style={{ padding: "1px 5px", borderRadius: 99, fontSize: 8, fontWeight: 700, background: greenBg, border: `1px solid ${greenBorder}`, color: green, fontFamily: "var(--font-mono)" }}>{m.cat}</span>
                </div>
              </div>
              {/* Activate/deactivate = move to right column */}
              <button onClick={() => toggleVisible(m)} title={m.visible ? "Odebrat z hlavní stránky" : "Zobrazit na hlavní stránce"} style={{
                display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 7, cursor: "pointer",
                borderColor: m.visible ? greenBorder : "hsl(var(--border))",
                background: m.visible ? greenBg : "hsl(var(--muted)/0.4)",
                color: m.visible ? green : "hsl(var(--muted-foreground))",
                border: "1px solid", fontSize: 11, fontWeight: 600, fontFamily: "var(--font-body)",
              }}>
                {m.visible ? <><EyeOff size={11} /> Skrýt</> : <><Eye size={11} /> Aktivovat</>}
              </button>
              <button onClick={() => handleDelete(m.id)} title="Smazat" style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 30, height: 30, borderRadius: 7, cursor: "pointer",
                background: "hsl(var(--destructive)/0.1)", border: "1px solid hsl(var(--destructive)/0.3)",
                color: "hsl(var(--destructive))",
              }}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
