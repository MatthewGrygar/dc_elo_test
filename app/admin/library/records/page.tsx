"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Edit2, Check, X, RotateCcw, Info, ChevronDown } from "lucide-react";

// ── Types (mirrored from dataFetchers) ───────────────────────────────────────
interface RecordEntry {
  value: string;
  player?: string;
  detail?: string;
  detail2?: string;
  isAllTime?: boolean;
}
interface RecordItem { label: string; entry: RecordEntry | null; }
interface RecordCategory { id: string; title: string; icon: string; records: RecordItem[]; }
interface RecordsData { categories: RecordCategory[]; }

interface RecordOverride {
  key: string;      // "<categoryId>/<label>"
  value: string;
  player?: string;
  detail?: string;
  detail2?: string;
  note?: string;
  updatedAt: string;
}

// ── Data-source reference per category/record ─────────────────────────────────
// Maps categoryId → { label → { sheet, columns, description } }
const DATA_SOURCE: Record<string, { sheet: string; cols: string; note: string }> = {
  "elo-absolute": {
    sheet: "Elo standings / Tournament_Elo",
    cols: "A (jméno) · B (aktuální ELO) · H (peak ELO)",
    note: "Standings řádky 2+. Min ELO a range se počítá z karet col I (ELO po zápase).",
  },
  "gains-losses": {
    sheet: "Player cards (CSV) / Player cards (CSV) - Tournament",
    cols: "A (hráč) · H (Δ ELO) · I (ELO po) · D (turnaj) · E (datum) · F (soupeř)",
    note: "Každý řádek = 1 zápas jednoho hráče. Comeback = max(peak−min) v časové řadě ELO (col I).",
  },
  streaks: {
    sheet: "Player cards (CSV) / Player cards (CSV) - Tournament",
    cols: "A (hráč) · G (výsledek: Won/Lost/Draw) · E (datum)",
    note: "Řádky seřazené dle data. Win streak = max consecutive 'Won' v col G. Aktivní = trailing Won od konce.",
  },
  activity: {
    sheet: "Player cards (CSV) / Player cards (CSV) - Tournament",
    cols: "A (hráč) · B (matchId) · E (datum)",
    note: "Komunita: unique matchIds per datum (col B+E). Hráč: řádky per den/měsíc. Kariéra = lastDate − firstDate.",
  },
  opponents: {
    sheet: "Player cards (CSV) / Player cards (CSV) - Tournament",
    cols: "A (hráč) · B (matchId) · F (soupeř+ELO) · G (výsledek) · H (Δ ELO) · I (ELO po)",
    note: "Soupeřovo ELO z col F formát 'Jméno (1500)'. Páry zápasů = same matchId. Rivalství = unique matchId pairs.",
  },
  tournaments: {
    sheet: "Player cards (CSV) / Player cards (CSV) - Tournament",
    cols: "A (hráč) · B (matchId) · C (typ turnaje) · D (detail turnaje) · E (datum) · F (soupeř+ELO) · H (Δ ELO)",
    note: "Turnajový klíč = concat(col D, col E). Perf Rating = (ΣoppELO + 400×(V−P)) / zápasy. Min 3 hry na turnaj.",
  },
  stats: {
    sheet: "Player cards (CSV) / Player cards (CSV) - Tournament",
    cols: "A (hráč) · G (výsledek) · H (Δ ELO) · F (soupeř+ELO) · I (ELO po)",
    note: "ELO před = col I − col H. Stability Index = max(0, 100 − stdDev(Δ)×2). OQA WR = Σ(výhra×oppELO)/ΣoppELO×100. Min her: ELO=50, DCPR=20.",
  },
};

const RECORD_DETAIL: Record<string, Record<string, string>> = {
  "elo-absolute": {
    "Nejvyšší ELO v historii komunity": "max(col H) ze standings — historické peak každého hráče, vybírá se globální maximum.",
    "Nejvyšší aktuální ELO": "max(col B) ze standings — aktuální ELO hodnocení, horní řádek po seřazení.",
    "Nejnižší ELO v historii komunity": "min(col I) z karet kde hodnota > 0 — nejnižší zaznamenaná ELO hodnota po zápase.",
    "Největší ELO range kariéry": "max(peakElo − minElo) přes všechny hráče — kdo má největší rozdíl mezi svým maximem a minimem.",
  },
  "gains-losses": {
    "Největší jednorázový zisk ELO": "max(col H) přes všechny karty — jeden zápas s nejvyšší kladnou hodnotou v col H.",
    "Největší jednorázová ztráta ELO": "min(col H) přes všechny karty — jeden zápas s nejzápornější hodnotou v col H.",
    "Hráč s nejvyšším lifetime ELO ziskem": "max(Σ col H per hráč) min 30 her — kumulativní součet všech Δ ELO v kariéře.",
    "Hráč s nejhorší lifetime ELO bilancí": "min(Σ col H per hráč) min 30 her — nejvíce záporný kumulativní součet Δ ELO.",
    "Největší ELO zisk za 1 den": "max(Σ col H per hráč per datum) min 5 her — součet Δ ELO ve všech zápasech za jeden den.",
    "Největší ELO ztráta za 1 den": "min(Σ col H per hráč per datum, <0) min 5 her — největší záporný denní součet.",
    "Největší ELO zisk za 1 měsíc": "max(Σ col H per hráč per měsíc) min 5 her — součet Δ ELO v jednom kalendářním měsíci.",
    "Největší ELO ztráta za 1 měsíc": "min(Σ col H per hráč per měsíc, <0) min 5 her — největší záporný měsíční součet.",
    "Největší comeback v historii komunity": "max(max(col I[j]) − min(col I[i]) kde i<j) min 10 her — největší vzestup ELO od lokálního minima k pozdějšímu maximu v chronologické řadě.",
  },
  streaks: {
    "Nejdelší win streak v historii": "max(consecutive 'Won' v col G) min 10 her — nejdelší nepřerušená série výher kdykoli v historii hráče.",
    "Nejdelší lose streak v historii": "max(consecutive 'Lost' v col G) min 10 her — nejdelší nepřerušená série proher.",
    "Nejdelší unbeaten streak (bez prohry)": "max(consecutive non-'Lost' v col G) min 10 her — série bez prohry (výhry + remízy).",
    "Aktuálně nejdelší aktivní win streak": "trailing consecutive 'Won' od konce karty hráče — aktuálně probíhající win streak.",
  },
  activity: {
    "Hráč s nejvíce odehranými hrami": "max(počet řádků per hráč v col A) — celkový počet záznamů v kartách.",
    "Hráč s nejvíce hrami za 1 den": "max(počet řádků per hráč per col E datum) min 5 her — nejvyšší denní aktivita.",
    "Hráč s nejvíce hrami za 1 měsíc": "max(počet řádků per hráč per měsíc) min 10 her — nejvyšší měsíční aktivita.",
    "Den s nejvíce zápasy (komunita)": "max(unique col B matchId per col E datum) — den s nejvyšším počtem unikátních matchId.",
    "Měsíc s nejvíce zápasy (komunita)": "max(unique col B matchId per měsíc) — měsíc s nejvyšším počtem unikátních matchId.",
    "Hráč s nejdelší kariérou (dny)": "max(lastDate − firstDate ve dnech) min 10 her — největší časový rozsah první–poslední zápas.",
    "Nejdelší nepřetržité aktivní období": "max(sum dní v sekvencích kde gap ≤30d mezi zápasy) min 10 her — nejdelší súvislé aktivní období.",
  },
  opponents: {
    "Největší upset v historii komunity": "max(oppElo − myElo) kde col G='Won' a oppElo > myElo — největší překvapení přes celou komunitu. oppElo z col F formát '(1500)', myElo = col I − col H.",
    "Hráč s nejvyšším avg ELO soupeřů": "max(avg(oppElo per player)) min 20 her — průměr ELO ze col F přes všechny zápasy hráče.",
    "Zápas s největším ELO rozdílem": "max(|elo_player1 − elo_player2|) přes páry se stejným col B matchId — oba hráči musí být v kartách.",
    "Největší rivalství": "páry hráčů se stejným col B matchId, seřazeny dle počtu vzájemných matchId — Top 5 rivalství.",
    "Hráč s nejvyšším počtem různých soupeřů": "max(unique oppName z col F per player) min 20 her — počet různých jmen ze col F.",
    "Nejdéle trvající rivalství": "max(lastDate − firstDate) pro páry se ≥2 vzájemnými zápasy min 5 her — nejdéle trvající pravidelné soupeření.",
  },
  tournaments: {
    "Turnaj s nejvíce zápasy": "max(unique matchId per turnajový klíč) — klíč = concat(col D, col E). Zobrazuje počet hráčů (unique col A per klíč).",
    "Nejtěžší turnaj (avg ELO hráčů)": "max(avg(col I − col H per turnaj)) — průměrné ELO hráčů (před zápasem) v turnaji.",
    "Nejlepší performance rating (all-time)": "max((ΣoppELO + 400×(V−P)) / n per player per turnaj) min 3 hry — globální maximum přes všechny hráče a turnaje.",
    "Hráč s nejvyšším ELO ziskem v turnaji": "max(Σ col H per player per turnajový klíč) min 5 her — největší kladný součet Δ ELO v jednom turnaji.",
    "Hráč s největší ELO ztrátou v turnaji": "min(Σ col H per player per turnajový klíč, <0) min 5 her — největší záporný součet v jednom turnaji.",
    "Hráč s nejvyšším počtem turnajů": "max(unique turnajový klíč per player) min 5 her — počet distinct concat(col D, col E) v kartách hráče.",
    "Nejlepší avg performance rating": "max(bestTournamentPerf per player) kde player.uniqueTournaments ≥ 10 (ELO) / 5 (DCPR) — průměrný perf rating přes turnaje hráče.",
  },
  stats: {
    "Nejvyšší winrate": "max(wins/games×100) min 50/20 her — wins = count('Won' v col G), games = total řádků per player.",
    "Nejnižší winrate": "min(wins/games×100, >0%) min 50/20 her — nenulový winrate, aby se vyloučili hráči bez výher.",
    "Nejvyšší průměrná Δ ELO/zápas (min. 30 her)": "max(Σ col H / count) min 30 her — průměrná hodnota col H přes všechny zápasy hráče.",
    "Nejvyšší Stability Index": "max(100 − stdDev(col H)×2, 0) min 50/20 her — čím nižší rozptyl Δ ELO, tím vyšší index. stdDev = směrodatná odchylka col H.",
    "Nejvyšší OQA Winrate": "max(Σ(výhra×oppELO) / ΣoppELO × 100) min 50/20 her — Opponent Quality Adjusted WR. oppELO z col F. Váží výhry dle síly soupeře.",
    "Nejlepší Expected Win Differential (min. 30 her)": "max(actualWins − expectedWins) min 30 her — expectedWins = Σ(1/(1+10^((oppElo−myElo)/400))). Kladné = overperformance.",
    "Hráč s nejvyšším Upset Faktorem": "max(biggestUpset per player) min 20 her — největší ELO diff výhry (oe−myElo kde Won a oe > myElo) v kariéře hráče.",
  },
};

const green = "hsl(152,72%,45%)";
const greenBg = "hsl(152 72% 45% / 0.1)";
const greenBorder = "hsl(152 72% 45% / 0.28)";
const amber = "hsl(42,80%,52%)";
const amberBg = "hsl(42 80% 52% / 0.12)";

// ── Inline edit form for one record ──────────────────────────────────────────
function RecordEditForm({ recKey, entry, existingOverride, onSave, onDelete, onCancel }: {
  recKey: string;
  entry: RecordEntry | null;
  existingOverride: RecordOverride | null;
  onSave: (ov: Partial<RecordOverride>) => Promise<void>;
  onDelete: () => Promise<void>;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(existingOverride?.value ?? entry?.value ?? "");
  const [player, setPlayer] = useState(existingOverride?.player ?? entry?.player ?? "");
  const [detail, setDetail] = useState(existingOverride?.detail ?? entry?.detail ?? "");
  const [detail2, setDetail2] = useState(existingOverride?.detail2 ?? entry?.detail2 ?? "");
  const [note, setNote] = useState(existingOverride?.note ?? "");
  const [saving, setSaving] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "6px 10px", borderRadius: 7, fontSize: 12,
    background: "hsl(var(--muted)/0.5)", border: "1px solid hsl(var(--border))",
    color: "hsl(var(--foreground))", fontFamily: "var(--font-mono)", outline: "none",
  };

  async function handleSave() {
    if (!value.trim()) return;
    setSaving(true);
    await onSave({ value: value.trim(), player: player.trim() || undefined, detail: detail.trim() || undefined, detail2: detail2.trim() || undefined, note: note.trim() || undefined });
    setSaving(false);
  }

  return (
    <div style={{
      marginTop: 6, padding: "12px 14px", borderRadius: 9,
      background: "hsl(var(--card)/0.8)", border: `1px solid ${greenBorder}`,
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: green, marginBottom: 8 }}>
        Upravit hodnotu záznamu
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 6 }}>
        <div>
          <label style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", display: "block", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.08em" }}>Hodnota *</label>
          <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="např. 2 034" style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", display: "block", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.08em" }}>Hráč</label>
          <input value={player} onChange={(e) => setPlayer(e.target.value)} placeholder="jméno hráče" style={inputStyle} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 6 }}>
        <div>
          <label style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", display: "block", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.08em" }}>Detail (datum / kontext)</label>
          <input value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="např. 15.3.2025" style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", display: "block", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.08em" }}>Detail 2 (vs. soupeř…)</label>
          <input value={detail2} onChange={(e) => setDetail2(e.target.value)} placeholder="např. vs. Ondra · Turnaj" style={inputStyle} />
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", display: "block", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.08em" }}>Poznámka (proč upravuješ — interně)</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="např. Oprava chyby v datech..." style={inputStyle} />
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button onClick={handleSave} disabled={saving || !value.trim()} style={{
          display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 7,
          background: saving ? greenBg : green, color: saving ? green : "#000",
          border: `1px solid ${greenBorder}`, fontSize: 11, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
          fontFamily: "var(--font-body)",
        }}>
          <Check size={11} /> {saving ? "Ukládám…" : "Uložit override"}
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
  );
}

// ── Single record row ─────────────────────────────────────────────────────────
function RecordRow({ catId, rec, override, detail, onSaveOverride, onDeleteOverride }: {
  catId: string;
  rec: RecordItem;
  override: RecordOverride | null;
  detail: string | null;
  onSaveOverride: (key: string, ov: Partial<RecordOverride>) => Promise<void>;
  onDeleteOverride: (key: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const key = `${catId}/${rec.label}`;
  const hasOverride = !!override;
  const entry = rec.entry;

  // Merge: show override values over computed
  const displayEntry = entry ? {
    ...entry,
    value: override?.value ?? entry.value,
    player: override?.player ?? entry.player,
    detail: override?.detail ?? entry.detail,
    detail2: override?.detail2 ?? entry.detail2,
  } : null;

  if (!displayEntry) return (
    <div style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid hsl(var(--border)/0.15)" }}>
      <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground)/0.5)", flex: 1 }}>{rec.label}</span>
      <span style={{ fontSize: 10, color: "hsl(var(--muted-foreground)/0.35)", fontFamily: "var(--font-mono)" }}>—</span>
    </div>
  );

  return (
    <div style={{ borderBottom: "1px solid hsl(var(--border)/0.15)", background: editing ? "hsl(var(--card)/0.5)" : hasOverride ? amberBg : "transparent" }}>
      <div style={{ padding: "9px 14px", display: "flex", alignItems: "flex-start", gap: 10 }}>
        {/* Indicator */}
        {hasOverride && <div style={{ width: 4, height: 36, borderRadius: 2, background: amber, flexShrink: 0, marginTop: -1 }} title="Má override" />}

        {/* Label + details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--foreground))" }}>{rec.label}</span>
            {displayEntry.isAllTime && (
              <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: `${amber}22`, color: amber, border: `1px solid ${amber}40`, fontFamily: "var(--font-mono)" }}>ALL TIME</span>
            )}
            {hasOverride && (
              <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: amberBg, color: amber, border: `1px solid ${amber}40`, fontFamily: "var(--font-mono)" }}>OVERRIDE</span>
            )}
          </div>
          {displayEntry.player && <div style={{ fontSize: 11, color: green, fontFamily: "var(--font-mono)" }}>{displayEntry.player}</div>}
          {displayEntry.detail && <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{displayEntry.detail}</div>}
          {displayEntry.detail2 && <div style={{ fontSize: 9, color: "hsl(var(--muted-foreground)/0.65)", fontFamily: "var(--font-mono)" }}>{displayEntry.detail2}</div>}
          {hasOverride && override?.note && (
            <div style={{ fontSize: 9, color: amber, fontFamily: "var(--font-mono)", marginTop: 2 }}>📝 {override.note}</div>
          )}
        </div>

        {/* Value */}
        <div style={{ textAlign: "right", flexShrink: 0, minWidth: 80 }}>
          <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-mono)", color: hasOverride ? amber : "hsl(var(--foreground))", letterSpacing: "-0.02em" }}>
            {displayEntry.value}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 4, flexShrink: 0, alignSelf: "center" }}>
          {detail && (
            <button onClick={() => setShowDetail((s) => !s)} title="Jak se počítá" style={{
              width: 24, height: 24, borderRadius: 6, border: "1px solid hsl(var(--border))", cursor: "pointer",
              background: showDetail ? greenBg : "hsl(var(--muted)/0.3)", color: showDetail ? green : "hsl(var(--muted-foreground))",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Info size={11} />
            </button>
          )}
          <button onClick={() => setEditing((s) => !s)} title={editing ? "Zavřít" : "Upravit"} style={{
            width: 24, height: 24, borderRadius: 6, border: `1px solid ${editing ? greenBorder : "hsl(var(--border))"}`,
            cursor: "pointer",
            background: editing ? greenBg : "hsl(var(--muted)/0.3)",
            color: editing ? green : "hsl(var(--muted-foreground))",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {editing ? <X size={11} /> : <Edit2 size={11} />}
          </button>
        </div>
      </div>

      {/* Detail explanation */}
      {showDetail && detail && (
        <div style={{ margin: "0 14px 8px", padding: "8px 12px", borderRadius: 8, background: "hsl(var(--muted)/0.3)", border: "1px solid hsl(var(--border))", fontSize: 11, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
          {detail}
        </div>
      )}

      {/* Edit form */}
      {editing && (
        <div style={{ padding: "0 14px 12px" }}>
          <RecordEditForm
            recKey={key}
            entry={entry}
            existingOverride={override}
            onSave={async (ov) => { await onSaveOverride(key, ov); setEditing(false); }}
            onDelete={async () => { await onDeleteOverride(key); setEditing(false); }}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}
    </div>
  );
}

// ── Category block ────────────────────────────────────────────────────────────
function CategoryBlock({ cat, overrideMap, onSave, onDelete }: {
  cat: RecordCategory;
  overrideMap: Map<string, RecordOverride>;
  onSave: (key: string, ov: Partial<RecordOverride>) => Promise<void>;
  onDelete: (key: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(true);
  const ds = DATA_SOURCE[cat.id];
  const validCount = cat.records.filter((r) => r.entry && r.entry.value !== "—").length;
  const overrideCount = cat.records.filter((r) => overrideMap.has(`${cat.id}/${r.label}`)).length;

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid hsl(var(--border))", background: "hsl(var(--card)/0.5)" }}>
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px", background: "hsl(var(--card)/0.7)", border: "none", cursor: "pointer",
          fontFamily: "var(--font-body)", textAlign: "left", borderBottom: open ? "1px solid hsl(var(--border))" : "none",
        }}
      >
        <span style={{ fontSize: 18, flexShrink: 0 }}>{cat.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--foreground))" }}>{cat.title}</div>
          {ds && (
            <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", marginTop: 1 }}>
              {ds.sheet}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{validCount} záznamů</span>
          {overrideCount > 0 && (
            <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: amberBg, color: amber, border: `1px solid ${amber}40`, fontFamily: "var(--font-mono)" }}>
              {overrideCount} override
            </span>
          )}
          <ChevronDown size={14} style={{ color: "hsl(var(--muted-foreground))", transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
        </div>
      </button>

      {/* Data source info */}
      {open && ds && (
        <div style={{ padding: "8px 16px", background: "hsl(var(--muted)/0.2)", borderBottom: "1px solid hsl(var(--border)/0.5)", fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
          <span style={{ fontWeight: 700, color: "hsl(var(--foreground))" }}>Sloupce: </span>{ds.cols}<br />
          {ds.note}
        </div>
      )}

      {/* Records */}
      {open && (
        <div>
          {cat.records.map((rec) => (
            <RecordRow
              key={rec.label}
              catId={cat.id}
              rec={rec}
              override={overrideMap.get(`${cat.id}/${rec.label}`) ?? null}
              detail={RECORD_DETAIL[cat.id]?.[rec.label] ?? null}
              onSaveOverride={onSave}
              onDeleteOverride={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function RecordsLibraryPage() {
  const [mode, setMode] = useState<"ELO" | "DCPR">("ELO");
  const [data, setData] = useState<RecordsData | null>(null);
  const [overrides, setOverrides] = useState<RecordOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const [recRes, ovRes] = await Promise.all([
        fetch(`/api/records?mode=${mode}`),
        fetch("/api/admin/record-overrides"),
      ]);
      if (!recRes.ok) throw new Error("records failed");
      const [rec, ov] = await Promise.all([recRes.json(), ovRes.ok ? ovRes.json() : []]);
      setData(rec);
      setOverrides(ov);
    } catch {
      setError(true);
    }
    setLoading(false);
  }, [mode]);

  useEffect(() => { load(); }, [load]);

  const overrideMap = new Map(overrides.map((o) => [o.key, o]));

  async function handleSave(key: string, partial: Partial<RecordOverride>) {
    const body: RecordOverride = {
      key,
      value: partial.value ?? "",
      player: partial.player,
      detail: partial.detail,
      detail2: partial.detail2,
      note: partial.note,
      updatedAt: new Date().toISOString(),
    };
    const res = await fetch("/api/admin/record-overrides", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setOverrides((prev) => {
        const next = prev.filter((o) => o.key !== key);
        return [...next, body];
      });
      // Reload to get re-merged computed view
      await load();
    }
  }

  async function handleDelete(key: string) {
    const res = await fetch("/api/admin/record-overrides", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    if (res.ok) {
      setOverrides((prev) => prev.filter((o) => o.key !== key));
      await load();
    }
  }

  const totalOverrides = overrides.length;

  return (
    <div style={{ maxWidth: 1000 }}>
      {/* Page header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>🏆</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>
            Rekordy — Knihovna
          </h1>
          {totalOverrides > 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: amberBg, color: amber, border: `1px solid ${amber}40`, fontFamily: "var(--font-mono)" }}>
              {totalOverrides} aktivních override
            </span>
          )}
        </div>
        <p style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", margin: "0 0 6px", lineHeight: 1.5 }}>
          Živá data z API — přesně co se zobrazuje na stránce Rekordy. Klikni na <strong>ℹ</strong> pro vysvětlení výpočtu, na ✏️ pro ruční úpravu (override uložen do KV, přepíše automatický výpočet).
        </p>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", padding: "6px 12px", borderRadius: 7, background: "hsl(var(--muted)/0.3)", display: "inline-block" }}>
          Google Sheet ID: 1y98bzsIRpVv0_cGNfbITapucO5A6izeEz5lTM92ZbIA
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.25rem" }}>
        {(["ELO", "DCPR"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: "6px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
            border: `1px solid ${mode === m ? greenBorder : "hsl(var(--border))"}`,
            background: mode === m ? greenBg : "transparent",
            color: mode === m ? green : "hsl(var(--muted-foreground))",
            fontFamily: "var(--font-mono)",
          }}>{m}</button>
        ))}
        <button onClick={load} disabled={loading} style={{
          display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 8,
          border: "1px solid hsl(var(--border))", background: "transparent",
          color: "hsl(var(--muted-foreground))", fontSize: 12, cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "var(--font-body)",
        }}>
          <RefreshCw size={12} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          {loading ? "Načítám…" : "Obnovit"}
        </button>
      </div>

      {/* Content */}
      {error && (
        <div style={{ padding: "2rem", textAlign: "center", borderRadius: 12, background: "hsl(var(--destructive)/0.1)", border: "1px solid hsl(var(--destructive)/0.3)", color: "hsl(var(--destructive))", fontSize: 13 }}>
          Chyba při načítání rekordů. Zkus obnovit.
        </div>
      )}

      {loading && !data && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[180, 220, 160, 200, 140, 180, 150].map((h, i) => (
            <div key={i} style={{ height: h, borderRadius: 12, background: "hsl(var(--muted)/0.4)", animation: "rec-pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      )}

      {!error && data && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.categories.map((cat) => (
            <CategoryBlock
              key={cat.id}
              cat={cat}
              overrideMap={overrideMap}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes rec-pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
      `}</style>
    </div>
  );
}
