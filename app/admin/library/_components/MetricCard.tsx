"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Edit2, X, Check, RotateCcw, AlertTriangle, Eye, EyeOff, HelpCircle, Tag } from "lucide-react";

export interface Metric {
  name: string;
  tag?: string;        // e.g. "%" | "číslo" | "text"
  tagColor?: string;
  description: string;
  formula: string;     // plain text / pseudocode
  example: string;     // concrete dosazení
}

export interface MetricOverride {
  key: string;         // "<pageId>/<metricName>"
  customLabel?: string;
  formula?: string;
  updatedAt: string;
}

const green = "hsl(152,72%,45%)";
const greenBg = "hsl(152 72% 45% / 0.08)";
const greenBorder = "hsl(152 72% 45% / 0.25)";
const amber = "hsl(42,80%,52%)";
const amberBg = "hsl(42 80% 52% / 0.12)";
const red = "hsl(0,72%,55%)";
const redBg = "hsl(0 72% 55% / 0.1)";
const redBorder = "hsl(0 72% 55% / 0.3)";

// ── Formula syntax help modal ─────────────────────────────────────────────────
function FormulaSyntaxHelp({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 1100,
        background: "hsl(var(--background) / 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div style={{
        width: "100%", maxWidth: 520,
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        borderRadius: 14, overflow: "hidden",
        boxShadow: "0 20px 60px -10px hsl(0 0% 0% / 0.4)",
      }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid hsl(var(--border))", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--foreground))" }}>📗 Syntaxe vzorců — Excel / Google Sheets</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "hsl(var(--muted-foreground))", padding: 2 }}><X size={14} /></button>
        </div>
        <div style={{ padding: "14px 16px", overflow: "auto", maxHeight: "70vh" }}>
          <pre style={{ margin: 0, fontSize: 11, fontFamily: "var(--font-mono)", color: "hsl(var(--foreground))", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{`Funkce:
  MAX(rozsah)              nejvyšší hodnota
  MIN(rozsah)              nejnižší hodnota
  SUM(rozsah)              součet hodnot
  AVERAGE(rozsah)          průměr
  COUNT(rozsah)            počet čísel
  COUNTA(rozsah)           počet neprázdných buněk
  COUNTIF(r, podmínka)     počet splňujících podmínku
  SUMIF(r, podmínka, s)    součet kde podmínka platí
  IF(podmínka, a, b)       podmíněná hodnota
  IFS(p1,h1, p2,h2, …)    více podmínek
  STDEV(rozsah)            směrodatná odchylka
  VAR(rozsah)              rozptyl
  VLOOKUP(h, r, sl, 0)    svislé vyhledávání
  INDEX(r, řádek, sl)      hodnota na pozici
  MATCH(h, h, 0)           pozice hledané hodnoty
  LEN(text)                délka textu
  TRIM(text)               oříznutí mezer
  TEXT(číslo, formát)      formátování čísla

Operátory:
  +  -  *  /  ^  ()       aritmetika
  =  <>  >  <  >=  <=     porovnání
  &                        zřetězení textu ("Ahoj"&" "&"světe")

Sloupce (Player cards CSV):
  A = hráč       B = matchId    C = typ turnaje
  D = detail     E = datum      F = soupeř (jméno + ELO)
  G = výsledek   H = Δ ELO      I = ELO po zápase

Sloupce (Elo standings):
  A = jméno      B = aktuální ELO    H = peak ELO

Příklady lineárního zápisu:
  MAX(H:H)
  SUM(H2:H1000) / COUNT(H2:H1000)
  COUNTIF(G:G, "Won") / COUNT(G:G) * 100
  MAX(I:I) - MIN(I:I)
  IF(G2="Won", 1/(1+10^((oppElo-myElo)/400)), 0)`}</pre>
        </div>
      </div>
    </div>
  );
}

// ── Password confirmation modal ───────────────────────────────────────────────
function ConfirmModal({ label, onConfirmed, onCancel }: {
  label: string;
  onConfirmed: () => void;
  onCancel: () => void;
}) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 60); }, []);

  async function handleConfirm() {
    if (!password) { setError("Zadej heslo."); return; }
    setChecking(true); setError("");
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) { onConfirmed(); }
      else if (res.status === 429) { setError("Příliš mnoho pokusů."); }
      else { setError("Nesprávné heslo."); setPassword(""); inputRef.current?.focus(); }
    } catch { setError("Chyba sítě."); }
    setChecking(false);
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "hsl(var(--background) / 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div style={{
        width: "100%", maxWidth: 440,
        background: "hsl(var(--card))",
        border: `1px solid ${redBorder}`,
        borderRadius: 16, overflow: "hidden",
        boxShadow: `0 0 60px -10px ${redBg}`,
      }}>
        <div style={{ height: 3, background: `linear-gradient(90deg, ${red}, transparent)` }} />
        <div style={{
          padding: "16px 20px 14px", background: redBg,
          borderBottom: `1px solid ${redBorder}`,
          display: "flex", alignItems: "flex-start", gap: 12,
        }}>
          <AlertTriangle size={22} style={{ color: red, flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: red, letterSpacing: "-0.01em", marginBottom: 4 }}>POZOR!</div>
            <div style={{ fontSize: 12, color: "hsl(var(--foreground))", lineHeight: 1.55 }}>
              Editujete provozní prostředí, pečlivě prosím tuto změnu promyslete.
            </div>
          </div>
        </div>
        <div style={{ padding: "18px 20px 20px" }}>
          <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", marginBottom: 14, lineHeight: 1.5 }}>
            Chystáš se upravit metriku:<br />
            <span style={{ fontWeight: 700, color: "hsl(var(--foreground))", fontFamily: "var(--font-mono)", fontSize: 12 }}>{label}</span>
          </div>
          <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsl(var(--muted-foreground))", display: "block", marginBottom: 6 }}>Admin heslo</label>
          <div style={{ position: "relative", marginBottom: error ? 8 : 16 }}>
            <input
              ref={inputRef}
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleConfirm(); if (e.key === "Escape") onCancel(); }}
              placeholder="Zadej admin heslo…"
              style={{
                width: "100%", padding: "9px 36px 9px 12px", borderRadius: 8, fontSize: 13,
                background: "hsl(var(--muted)/0.4)", border: `1px solid ${error ? redBorder : "hsl(var(--border))"}`,
                color: "hsl(var(--foreground))", fontFamily: "var(--font-mono)", outline: "none",
                boxSizing: "border-box",
              }}
            />
            <button type="button" onClick={() => setShow((s) => !s)} style={{
              position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              color: "hsl(var(--muted-foreground))", padding: 2,
            }}>
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {error && <div style={{ fontSize: 11, color: red, marginBottom: 14, fontFamily: "var(--font-mono)" }}>{error}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleConfirm} disabled={checking || !password} style={{
              flex: 1, padding: "9px", borderRadius: 8,
              background: checking ? redBg : red, color: checking ? red : "#fff",
              border: `1px solid ${redBorder}`,
              fontSize: 13, fontWeight: 700, cursor: checking ? "not-allowed" : "pointer",
              fontFamily: "var(--font-body)",
            }}>
              {checking ? "Ověřuji…" : "Potvrdit úpravu"}
            </button>
            <button onClick={onCancel} style={{
              padding: "9px 18px", borderRadius: 8, border: "1px solid hsl(var(--border))",
              background: "transparent", color: "hsl(var(--muted-foreground))",
              fontSize: 13, cursor: "pointer", fontFamily: "var(--font-body)",
            }}>Zrušit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Metric edit form ──────────────────────────────────────────────────────────
function MetricEditForm({ metricKey, defaultName, defaultFormula, existingOverride, onSave, onDelete, onCancel }: {
  metricKey: string;
  defaultName: string;
  defaultFormula: string;
  existingOverride: MetricOverride | null;
  onSave: (ov: Partial<MetricOverride>) => Promise<void>;
  onDelete: () => Promise<void>;
  onCancel: () => void;
}) {
  const [customLabel, setCustomLabel] = useState(existingOverride?.customLabel ?? "");
  const [formula, setFormula] = useState(existingOverride?.formula ?? "");
  const [saving, setSaving] = useState(false);
  const [showSyntax, setShowSyntax] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "6px 10px", borderRadius: 7, fontSize: 12,
    background: "hsl(var(--muted)/0.5)", border: "1px solid hsl(var(--border))",
    color: "hsl(var(--foreground))", fontFamily: "var(--font-mono)", outline: "none",
    boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 9, color: "hsl(var(--muted-foreground))", display: "block",
    marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.08em",
  };

  async function handleSave() {
    setSaving(true);
    await onSave({
      customLabel: customLabel.trim() || undefined,
      formula: formula.trim() || undefined,
    });
    setSaving(false);
  }

  return (
    <>
      {showSyntax && <FormulaSyntaxHelp onClose={() => setShowSyntax(false)} />}
      <div style={{
        marginTop: 6, padding: "12px 14px", borderRadius: 9,
        background: "hsl(var(--card)/0.8)", border: `1px solid ${greenBorder}`,
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: green, marginBottom: 10 }}>
          Upravit metriku
        </div>

        {/* Custom label */}
        <div style={{ marginBottom: 8 }}>
          <label style={labelStyle}>
            <Tag size={8} style={{ display: "inline", marginRight: 3 }} />
            Přejmenovat atribut (vlastní název)
          </label>
          <input value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} placeholder={`${defaultName} (ponech prázdné = původní název)`} style={inputStyle} />
        </div>

        {/* Formula override */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Vzorec výpočtu (přepíše výchozí)</label>
            <button type="button" onClick={() => setShowSyntax(true)} style={{
              display: "flex", alignItems: "center", gap: 3, padding: "1px 6px", borderRadius: 4,
              background: "hsl(var(--muted)/0.4)", border: "1px solid hsl(var(--border))",
              cursor: "pointer", fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-body)",
            }}>
              <HelpCircle size={9} /> Syntaxe
            </button>
          </div>
          <textarea
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            placeholder={`${defaultFormula.substring(0, 80)}…\n\n(ponech prázdné = výchozí vzorec)`}
            rows={3}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={handleSave} disabled={saving} style={{
            display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 7,
            background: saving ? greenBg : green, color: saving ? green : "#000",
            border: `1px solid ${greenBorder}`, fontSize: 11, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
            fontFamily: "var(--font-body)",
          }}>
            <Check size={11} /> {saving ? "Ukládám…" : "Uložit"}
          </button>
          {existingOverride && (
            <button onClick={async () => { setSaving(true); await onDelete(); setSaving(false); }} disabled={saving} style={{
              display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 7,
              background: "hsl(var(--destructive)/0.1)", color: "hsl(var(--destructive))",
              border: "1px solid hsl(var(--destructive)/0.3)", fontSize: 11, fontWeight: 600, cursor: "pointer",
              fontFamily: "var(--font-body)",
            }}>
              <RotateCcw size={10} /> Zrušit override
            </button>
          )}
          <button onClick={onCancel} style={{
            display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 7,
            background: "transparent", color: "hsl(var(--muted-foreground))",
            border: "1px solid hsl(var(--border))", fontSize: 11, cursor: "pointer",
            fontFamily: "var(--font-body)",
          }}>
            <X size={10} /> Zrušit
          </button>
        </div>
      </div>
    </>
  );
}

// ── MetricCard (editable) ─────────────────────────────────────────────────────
export function MetricCard({ m, pageId, override, onSaveOverride, onDeleteOverride }: {
  m: Metric;
  pageId?: string;
  override?: MetricOverride | null;
  onSaveOverride?: (key: string, ov: Partial<MetricOverride>) => Promise<void>;
  onDeleteOverride?: (key: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const hasOverride = !!override;
  const displayName = override?.customLabel || m.name;
  const displayFormula = override?.formula || m.formula;
  const metricKey = pageId ? `${pageId}/${m.name}` : m.name;

  const canEdit = !!(pageId && onSaveOverride && onDeleteOverride);

  return (
    <>
      {confirming && (
        <ConfirmModal
          label={m.name}
          onConfirmed={() => { setConfirming(false); setEditing(true); }}
          onCancel={() => setConfirming(false)}
        />
      )}
      <div style={{
        borderRadius: 10, overflow: "hidden",
        border: `1px solid ${open ? greenBorder : hasOverride ? `${amber}40` : "hsl(var(--border))"}`,
        background: open ? greenBg : hasOverride ? amberBg : "hsl(var(--card)/0.5)",
        transition: "all .15s",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            onClick={() => setOpen((o) => !o)}
            style={{
              flex: 1, display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px", background: "none", border: "none", cursor: "pointer",
              fontFamily: "var(--font-body)", textAlign: "left",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: open ? green : "hsl(var(--foreground))", flex: 1 }}>
              {displayName}
              {override?.customLabel && (
                <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 400, color: "hsl(var(--muted-foreground))" }}>↩ {m.name}</span>
              )}
            </span>
            {m.tag && (
              <span style={{
                fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                background: m.tagColor ? `${m.tagColor}22` : "hsl(var(--muted)/0.6)",
                color: m.tagColor ?? "hsl(var(--muted-foreground))",
                border: `1px solid ${m.tagColor ? `${m.tagColor}40` : "hsl(var(--border))"}`,
                fontFamily: "var(--font-mono)", flexShrink: 0,
              }}>{m.tag}</span>
            )}
            {hasOverride && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: amberBg, color: amber, border: `1px solid ${amber}40`, fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                OVERRIDE
              </span>
            )}
            <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", flex: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>
              {!open && m.description}
            </span>
            <ChevronDown size={14} style={{ color: "hsl(var(--muted-foreground))", transform: open ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }} />
          </button>

          {/* Edit button */}
          {canEdit && (
            <button
              onClick={() => {
                if (editing) setEditing(false);
                else if (!open) setOpen(true);
                if (!editing) setConfirming(true);
              }}
              title={editing ? "Zavřít úpravu" : "Upravit metriku"}
              style={{
                width: 30, height: 30, borderRadius: 7, margin: "0 8px 0 0",
                border: `1px solid ${editing ? greenBorder : "hsl(var(--border))"}`,
                background: editing ? greenBg : "hsl(var(--muted)/0.3)",
                color: editing ? green : "hsl(var(--muted-foreground))",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {editing ? <X size={12} /> : <Edit2 size={12} />}
            </button>
          )}
        </div>

        {/* Expanded content */}
        {open && (
          <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ margin: 0, fontSize: 13, color: "hsl(var(--foreground))", lineHeight: 1.55 }}>
              {m.description}
            </p>

            {/* Formula */}
            <div style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${override?.formula ? greenBorder : "hsl(var(--border))"}` }}>
              <div style={{
                padding: "5px 12px", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", color: override?.formula ? green : "hsl(var(--muted-foreground))",
                background: override?.formula ? greenBg : "hsl(var(--muted)/0.4)", borderBottom: `1px solid ${override?.formula ? greenBorder : "hsl(var(--border))"}`,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                Výpočet {override?.formula && <span style={{ fontWeight: 400 }}>— vlastní vzorec</span>}
              </div>
              <pre style={{
                margin: 0, padding: "10px 14px", fontSize: 12, lineHeight: 1.6,
                fontFamily: "var(--font-mono)", color: "hsl(var(--foreground))",
                background: "hsl(var(--muted)/0.2)", whiteSpace: "pre-wrap", wordBreak: "break-word",
              }}>
                {displayFormula}
              </pre>
              {override?.formula && (
                <div style={{ padding: "4px 12px 6px", fontSize: 10, color: "hsl(var(--muted-foreground)/0.6)", fontFamily: "var(--font-mono)", background: "hsl(var(--muted)/0.1)", textDecoration: "line-through" }}>
                  Původní: {m.formula.substring(0, 100)}{m.formula.length > 100 ? "…" : ""}
                </div>
              )}
            </div>

            {/* Example */}
            <div style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${greenBorder}` }}>
              <div style={{
                padding: "5px 12px", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", color: green,
                background: greenBg, borderBottom: `1px solid ${greenBorder}`,
              }}>
                Příklad — dosazení
              </div>
              <pre style={{
                margin: 0, padding: "10px 14px", fontSize: 12, lineHeight: 1.6,
                fontFamily: "var(--font-mono)", color: "hsl(var(--foreground))",
                background: "hsl(var(--card)/0.5)", whiteSpace: "pre-wrap", wordBreak: "break-word",
              }}>
                {m.example}
              </pre>
            </div>

            {/* Edit form */}
            {editing && canEdit && (
              <MetricEditForm
                metricKey={metricKey}
                defaultName={m.name}
                defaultFormula={m.formula}
                existingOverride={override ?? null}
                onSave={async (ov) => {
                  await onSaveOverride!(metricKey, ov);
                  setEditing(false);
                }}
                onDelete={async () => {
                  await onDeleteOverride!(metricKey);
                  setEditing(false);
                }}
                onCancel={() => setEditing(false)}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ── LibraryPage (with live overrides) ────────────────────────────────────────
export function LibraryPage({
  title, subtitle, icon, metrics, pageId,
}: {
  title: string;
  subtitle: string;
  icon: string;
  metrics: Metric[];
  pageId: string;
}) {
  const [overrides, setOverrides] = useState<MetricOverride[]>([]);
  const [loadedOverrides, setLoadedOverrides] = useState(false);

  useEffect(() => {
    fetch("/api/admin/metric-overrides")
      .then((r) => r.ok ? r.json() : [])
      .then((data: MetricOverride[]) => {
        setOverrides(data.filter((o) => o.key.startsWith(`${pageId}/`)));
        setLoadedOverrides(true);
      })
      .catch(() => setLoadedOverrides(true));
  }, [pageId]);

  const overrideMap = new Map(overrides.map((o) => [o.key, o]));

  async function handleSave(key: string, partial: Partial<MetricOverride>) {
    const body: MetricOverride = { key, ...partial, updatedAt: new Date().toISOString() };
    const res = await fetch("/api/admin/metric-overrides", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setOverrides((prev) => {
        const next = prev.filter((o) => o.key !== key);
        return [...next, body];
      });
    }
  }

  async function handleDelete(key: string) {
    const res = await fetch("/api/admin/metric-overrides", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    if (res.ok) {
      setOverrides((prev) => prev.filter((o) => o.key !== key));
    }
  }

  const overrideCount = overrides.length;

  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 28 }}>{icon}</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>
            {title}
          </h1>
          {overrideCount > 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: amberBg, color: amber, border: `1px solid ${amber}40`, fontFamily: "var(--font-mono)" }}>
              {overrideCount} override
            </span>
          )}
        </div>
        <p style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", margin: 0, lineHeight: 1.5 }}>
          {subtitle}
        </p>
        <div style={{ marginTop: 8, fontSize: 11, color: "hsl(var(--muted-foreground))" }}>
          Klikni na metriku pro zobrazení vzorce a příkladu. Klikni na ✏️ pro úpravu vzorce nebo přejmenování atributu.
          {!loadedOverrides && <span style={{ marginLeft: 8, opacity: 0.6 }}>Načítám override data…</span>}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {metrics.map((m) => (
          <MetricCard
            key={m.name}
            m={m}
            pageId={pageId}
            override={overrideMap.get(`${pageId}/${m.name}`) ?? null}
            onSaveOverride={handleSave}
            onDeleteOverride={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
