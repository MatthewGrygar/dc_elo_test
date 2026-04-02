"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronUp, ChevronDown, Save, ArrowLeft } from "lucide-react";

type SectionType = "h2" | "p" | "code" | "ul";

interface Section {
  type: SectionType;
  text?: string;
  items?: string[];
}

interface ArticleData {
  id?: string;
  title: { cs: string; en: string; fr: string };
  excerpt: { cs: string; en: string; fr: string };
  body: Section[];
  tag: string;
  author: string;
  date: string;
  readTime: number;
  image?: string;
  inSlider: boolean;
  published: boolean;
}

const green = "hsl(152,72%,45%)";
const greenBg = "hsl(152 72% 45% / 0.1)";
const greenBorder = "hsl(152 72% 45% / 0.28)";

const TAGS = ["Analytika", "Turnaj", "Novinky", "Metodika", "Komunita", "Výsledky", "Jiné"];
const SECTION_LABELS: Record<SectionType, string> = { h2: "Nadpis H2", p: "Odstavec", code: "Kód", ul: "Odrážky" };

function Input({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, color: "hsl(var(--muted-foreground))", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "9px 12px",
          background: "hsl(var(--muted)/0.4)",
          border: "1px solid hsl(var(--border))", borderRadius: 8,
          color: "hsl(var(--foreground))", fontSize: 13,
          fontFamily: "var(--font-body)", outline: "none",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = green; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "hsl(var(--border))"; }}
      />
    </div>
  );
}

function Textarea({ label, value, onChange, rows = 3, placeholder, mono }: {
  label: string; value: string; onChange: (v: string) => void;
  rows?: number; placeholder?: string; mono?: boolean;
}) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, color: "hsl(var(--muted-foreground))", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "9px 12px",
          background: "hsl(var(--muted)/0.4)",
          border: "1px solid hsl(var(--border))", borderRadius: 8,
          color: "hsl(var(--foreground))", fontSize: 13,
          fontFamily: mono ? "var(--font-mono)" : "var(--font-body)",
          outline: "none", resize: "vertical",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = green; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "hsl(var(--border))"; }}
      />
    </div>
  );
}

function Toggle({ label, desc, value, onChange }: {
  label: string; desc?: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: 40, height: 22, borderRadius: 99,
          background: value ? green : "hsl(var(--muted))",
          border: `1px solid ${value ? greenBorder : "hsl(var(--border))"}`,
          position: "relative", transition: "all .2s", flexShrink: 0,
        }}>
        <div style={{
          width: 16, height: 16, borderRadius: "50%",
          background: "#fff",
          position: "absolute", top: 2,
          left: value ? 20 : 2,
          transition: "left .2s",
          boxShadow: "0 1px 4px rgba(0,0,0,.3)",
        }} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--foreground))" }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>{desc}</div>}
      </div>
    </label>
  );
}

function SectionEditor({ sections, onChange }: { sections: Section[]; onChange: (s: Section[]) => void }) {
  function update(idx: number, patch: Partial<Section>) {
    const next = [...sections];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  }
  function remove(idx: number) { onChange(sections.filter((_, i) => i !== idx)); }
  function move(idx: number, dir: -1 | 1) {
    const next = [...sections];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }
  function add(type: SectionType) {
    onChange([...sections, type === "ul" ? { type, items: [""] } : { type, text: "" }]);
  }

  const btnStyle = (active?: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", justifyContent: "center",
    width: 28, height: 28, borderRadius: 6, cursor: "pointer", border: "none",
    background: active ? greenBg : "hsl(var(--muted)/0.5)",
    color: active ? green : "hsl(var(--muted-foreground))",
  });

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "hsl(var(--muted-foreground))", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Obsah článku ({sections.length} sekcí)
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        {sections.map((sec, i) => (
          <div key={i} style={{
            background: "hsl(var(--muted)/0.3)", border: "1px solid hsl(var(--border))",
            borderRadius: 10, padding: "10px 12px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              {/* Type selector */}
              <select
                value={sec.type}
                onChange={(e) => {
                  const t = e.target.value as SectionType;
                  update(i, t === "ul" ? { type: t, text: undefined, items: [""] } : { type: t, text: sec.text ?? "", items: undefined });
                }}
                style={{
                  padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                  background: greenBg, border: `1px solid ${greenBorder}`, color: green,
                  cursor: "pointer", fontFamily: "var(--font-mono)",
                }}>
                {(Object.keys(SECTION_LABELS) as SectionType[]).map((t) => (
                  <option key={t} value={t}>{SECTION_LABELS[t]}</option>
                ))}
              </select>
              <div style={{ flex: 1 }} />
              {/* Move + delete */}
              <button style={btnStyle()} onClick={() => move(i, -1)} disabled={i === 0} title="Nahoru"><ChevronUp size={13} /></button>
              <button style={btnStyle()} onClick={() => move(i, 1)} disabled={i === sections.length - 1} title="Dolů"><ChevronDown size={13} /></button>
              <button onClick={() => remove(i)} title="Smazat" style={{
                ...btnStyle(), background: "hsl(var(--destructive)/0.1)",
                border: "1px solid hsl(var(--destructive)/0.3)", color: "hsl(var(--destructive))",
              }}><Trash2 size={11} /></button>
            </div>

            {/* Content */}
            {sec.type === "ul" ? (
              <div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {(sec.items ?? []).map((item, j) => (
                    <div key={j} style={{ display: "flex", gap: 6 }}>
                      <input
                        value={item}
                        onChange={(e) => {
                          const items = [...(sec.items ?? [])];
                          items[j] = e.target.value;
                          update(i, { items });
                        }}
                        placeholder={`Položka ${j + 1}`}
                        style={{
                          flex: 1, padding: "7px 10px", borderRadius: 6, fontSize: 13,
                          background: "hsl(var(--muted)/0.4)", border: "1px solid hsl(var(--border))",
                          color: "hsl(var(--foreground))", fontFamily: "var(--font-body)", outline: "none",
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = green; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "hsl(var(--border))"; }}
                      />
                      <button onClick={() => {
                        const items = (sec.items ?? []).filter((_, k) => k !== j);
                        update(i, { items: items.length ? items : [""] });
                      }} style={{ ...btnStyle(), background: "hsl(var(--destructive)/0.1)", color: "hsl(var(--destructive))", border: "none" }}>
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={() => update(i, { items: [...(sec.items ?? []), ""] })}
                  style={{ marginTop: 6, fontSize: 11, color: green, background: "none", border: "none", cursor: "pointer", padding: "3px 0", fontFamily: "var(--font-body)" }}>
                  + Přidat položku
                </button>
              </div>
            ) : (
              <textarea
                value={sec.text ?? ""}
                onChange={(e) => update(i, { text: e.target.value })}
                rows={sec.type === "h2" ? 1 : 3}
                placeholder={SECTION_LABELS[sec.type]}
                style={{
                  width: "100%", padding: "7px 10px", borderRadius: 6, fontSize: 13,
                  background: "hsl(var(--muted)/0.4)", border: "1px solid hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                  fontFamily: sec.type === "code" ? "var(--font-mono)" : "var(--font-body)",
                  outline: "none", resize: "vertical",
                  fontWeight: sec.type === "h2" ? 700 : 400,
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = green; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "hsl(var(--border))"; }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Add section buttons */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {(Object.keys(SECTION_LABELS) as SectionType[]).map((t) => (
          <button key={t} onClick={() => add(t)} style={{
            padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
            background: "hsl(var(--muted)/0.5)", border: "1px solid hsl(var(--border))",
            color: "hsl(var(--muted-foreground))", cursor: "pointer",
            fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: 5,
          }}>
            <Plus size={10} /> {SECTION_LABELS[t]}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────
export default function ArticleForm({ initial }: { initial?: ArticleData }) {
  const router = useRouter();
  const isEdit = !!initial?.id;

  const [titleCs, setTitleCs] = useState(initial?.title.cs ?? "");
  const [titleEn, setTitleEn] = useState(initial?.title.en ?? "");
  const [titleFr, setTitleFr] = useState(initial?.title.fr ?? "");
  const [excerptCs, setExcerptCs] = useState(initial?.excerpt.cs ?? "");
  const [excerptEn, setExcerptEn] = useState(initial?.excerpt.en ?? "");
  const [excerptFr, setExcerptFr] = useState(initial?.excerpt.fr ?? "");
  const [tag, setTag] = useState(initial?.tag ?? "Novinky");
  const [author, setAuthor] = useState(initial?.author ?? "");
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [readTime, setReadTime] = useState(String(initial?.readTime ?? 5));
  const [image, setImage] = useState(initial?.image ?? "");
  const [inSlider, setInSlider] = useState(initial?.inSlider ?? false);
  const [published, setPublished] = useState(initial?.published ?? false);
  const [sections, setSections] = useState<Section[]>(initial?.body ?? []);
  const [langTab, setLangTab] = useState<"cs" | "en" | "fr">("cs");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    const payload = {
      title: { cs: titleCs, en: titleEn, fr: titleFr },
      excerpt: { cs: excerptCs, en: excerptEn, fr: excerptFr },
      body: sections,
      tag, author, date,
      readTime: Number(readTime) || 5,
      image: image || undefined,
      inSlider, published,
    };
    try {
      const url = isEdit ? `/api/admin/articles/${initial!.id}` : "/api/admin/articles";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Chyba při ukládání");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("Chyba sítě.");
    } finally {
      setSaving(false);
    }
  }

  const LANGS = [
    { key: "cs" as const, label: "CS" },
    { key: "en" as const, label: "EN" },
    { key: "fr" as const, label: "FR" },
  ];

  const card: React.CSSProperties = {
    background: "hsl(var(--card)/0.7)", backdropFilter: "blur(12px)",
    border: "1px solid hsl(var(--border))", borderRadius: 14, padding: "1.5rem",
    marginBottom: "1.25rem",
  };

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Back + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.75rem" }}>
        <button onClick={() => router.push("/admin")} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "7px 12px",
          background: "hsl(var(--muted)/0.5)", border: "1px solid hsl(var(--border))",
          borderRadius: 8, fontSize: 12, color: "hsl(var(--muted-foreground))", cursor: "pointer",
          fontFamily: "var(--font-body)",
        }}>
          <ArrowLeft size={13} /> Zpět
        </button>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>
          {isEdit ? "Upravit článek" : "Nový článek"}
        </h1>
      </div>

      {/* ── Content section (language tabs) ── */}
      <div style={card}>
        <div style={{ display: "flex", gap: 4, marginBottom: "1.25rem" }}>
          {LANGS.map(({ key, label }) => (
            <button key={key} onClick={() => setLangTab(key)} style={{
              padding: "5px 14px", borderRadius: 7, fontSize: 12, fontWeight: 700,
              cursor: "pointer", border: "1px solid",
              borderColor: langTab === key ? greenBorder : "hsl(var(--border))",
              background: langTab === key ? greenBg : "transparent",
              color: langTab === key ? green : "hsl(var(--muted-foreground))",
              fontFamily: "var(--font-mono)",
            }}>{label}</button>
          ))}
        </div>

        {langTab === "cs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Input label="Nadpis (CS)" value={titleCs} onChange={setTitleCs} placeholder="Nadpis článku česky" />
            <Textarea label="Perex (CS)" value={excerptCs} onChange={setExcerptCs} rows={3} placeholder="Krátký popis česky" />
          </div>
        )}
        {langTab === "en" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Input label="Title (EN)" value={titleEn} onChange={setTitleEn} placeholder="Article title in English" />
            <Textarea label="Excerpt (EN)" value={excerptEn} onChange={setExcerptEn} rows={3} placeholder="Short description in English" />
          </div>
        )}
        {langTab === "fr" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Input label="Titre (FR)" value={titleFr} onChange={setTitleFr} placeholder="Titre de l'article en français" />
            <Textarea label="Extrait (FR)" value={excerptFr} onChange={setExcerptFr} rows={3} placeholder="Courte description en français" />
          </div>
        )}
      </div>

      {/* ── Meta ── */}
      <div style={card}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "hsl(var(--muted-foreground))", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Kategorie
            </label>
            <select value={tag} onChange={(e) => setTag(e.target.value)} style={{
              width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 13,
              background: "hsl(var(--muted)/0.4)", border: "1px solid hsl(var(--border))",
              color: "hsl(var(--foreground))", cursor: "pointer", fontFamily: "var(--font-body)",
            }}>
              {TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <Input label="Autor" value={author} onChange={setAuthor} placeholder="DCPR Komise" />
          <Input label="Datum" value={date} onChange={setDate} type="date" />
          <Input label="Doba čtení (min)" value={readTime} onChange={setReadTime} type="number" placeholder="5" />
        </div>
        <Input label="URL obrázku (volitelné)" value={image} onChange={setImage} placeholder="https://… nebo /obrazek.jpg" />
      </div>

      {/* ── Visibility ── */}
      <div style={{ ...card, display: "flex", flexDirection: "column", gap: "1.1rem" }}>
        <Toggle
          label="Publikováno"
          desc="Článek se zobrazí návštěvníkům webu"
          value={published}
          onChange={setPublished}
        />
        <div style={{ borderTop: "1px solid hsl(var(--border))" }} />
        <Toggle
          label="Zobrazit ve slideru"
          desc="Článek se objeví v hero slideru na hlavní stránce"
          value={inSlider}
          onChange={setInSlider}
        />
      </div>

      {/* ── Body sections ── */}
      <div style={card}>
        <SectionEditor sections={sections} onChange={setSections} />
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: "10px 14px", borderRadius: 8, marginBottom: "1rem",
          background: "hsl(var(--destructive)/0.12)", border: "1px solid hsl(var(--destructive)/0.3)",
          fontSize: 13, color: "hsl(var(--destructive))",
        }}>{error}</div>
      )}

      {/* Save */}
      <button onClick={save} disabled={saving} style={{
        display: "flex", alignItems: "center", gap: 8, padding: "11px 24px",
        background: saving ? greenBg : green, color: saving ? green : "#000",
        border: `1px solid ${greenBorder}`, borderRadius: 10,
        fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer",
        fontFamily: "var(--font-body)", transition: "all .15s",
      }}>
        <Save size={15} /> {saving ? "Ukládám…" : isEdit ? "Uložit změny" : "Vytvořit článek"}
      </button>
    </div>
  );
}
