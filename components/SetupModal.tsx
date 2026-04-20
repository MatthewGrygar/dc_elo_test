"use client";

import { useState, useEffect } from "react";

type Lang   = "cs" | "en" | "fr";
type Region = "FR" | "CZ" | "ALL";
type Mode   = "ELO" | "DCPR";

const TEXT = {
  cs: {
    welcome:  "Vítejte na DC ELO",
    sub:      "Rychlá personalizace — zabere jen 10 sekund.",
    region_h: "Jaký region vás zajímá?",
    region_d: "Podle výběru se přizpůsobí žebříček, statistiky i rekordy.",
    mode_h:   "Preferovaný rating systém",
    mode_d:   "Kdykoli lze přepnout v postranním panelu.",
    lang_h:   "Jazyk rozhraní",
    btn:      "Uložit a pokračovat",
    fr_label: "Francie", cz_label: "Česká republika", all_label: "Vše",
    elo_d:    "Klasický Elo systém",   dcpr_d: "Turnajový rating",
  },
  en: {
    welcome:  "Welcome to DC ELO",
    sub:      "Quick setup — takes just 10 seconds.",
    region_h: "Which region interests you?",
    region_d: "Leaderboard, stats and records will be filtered accordingly.",
    mode_h:   "Preferred rating system",
    mode_d:   "Can be switched anytime in the sidebar.",
    lang_h:   "Interface language",
    btn:      "Save and continue",
    fr_label: "France", cz_label: "Czech Republic", all_label: "All regions",
    elo_d:    "Classic Elo system",    dcpr_d: "Tournament rating",
  },
  fr: {
    welcome:  "Bienvenue sur DC ELO",
    sub:      "Configuration rapide — seulement 10 secondes.",
    region_h: "Quelle région vous intéresse ?",
    region_d: "Le classement, les stats et les records seront filtrés en conséquence.",
    mode_h:   "Système de rating préféré",
    mode_d:   "Modifiable à tout moment dans le panneau latéral.",
    lang_h:   "Langue de l'interface",
    btn:      "Enregistrer et continuer",
    fr_label: "France", cz_label: "Tchéquie", all_label: "Toutes régions",
    elo_d:    "Système Elo classique",  dcpr_d: "Rating tournoi",
  },
} as const;

function detectLang(): Lang {
  try {
    const bl = navigator.language.toLowerCase();
    if (bl.startsWith("fr")) return "fr";
    if (bl.startsWith("cs") || bl.startsWith("sk")) return "cs";
  } catch {}
  return "en";
}

export default function SetupModal({ onDone }: { onDone: () => void }) {
  const [uiLang, setUiLang] = useState<Lang>("en");
  const [region, setRegion] = useState<Region>("ALL");
  const [mode,   setMode]   = useState<Mode>("ELO");
  const [lang,   setLang]   = useState<Lang>("en");

  useEffect(() => {
    const d = detectLang();
    setUiLang(d);
    setLang(d);
  }, []);

  const t = TEXT[uiLang];
  const green = "hsl(152,72%,45%)";
  const amber = "hsl(42,80%,55%)";

  function submit() {
    try {
      localStorage.setItem("dc-elo-region", region);
      localStorage.setItem("dc-elo-mode",   mode);
      localStorage.setItem("dc-elo-lang",   lang);
      localStorage.setItem("dc-elo-setup",  "1");
    } catch {}
    onDone();
  }

  function OptionBtn({ active, onClick, title, children }: { active: boolean; onClick: () => void; title?: string; children: React.ReactNode }) {
    return (
      <button onClick={onClick} title={title} style={{
        flex: 1, padding: "10px 8px", borderRadius: 10, border: "2px solid",
        borderColor: active ? green : "hsl(var(--border)/0.4)",
        background: active ? `hsl(152,72%,45%/0.12)` : "hsl(var(--muted)/0.3)",
        color: active ? green : "hsl(var(--muted-foreground))",
        cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 11,
        fontWeight: active ? 700 : 400, transition: "all 0.15s", textAlign: "center" as const,
        boxShadow: active ? `0 0 14px hsl(152,72%,45%/0.25)` : "none",
        minHeight: 46,
      }}>
        {children}
      </button>
    );
  }

  const REGIONS: { value: Region; flag: string; label: string }[] = [
    { value: "FR",  flag: "🇫🇷", label: t.fr_label  },
    { value: "CZ",  flag: "🇨🇿", label: t.cz_label  },
    { value: "ALL", flag: "🌍", label: t.all_label },
  ];
  const LANGS: { value: Lang; flag: string; label: string }[] = [
    { value: "cs", flag: "🇨🇿", label: "Čeština"  },
    { value: "en", flag: "🇬🇧", label: "English"  },
    { value: "fr", flag: "🇫🇷", label: "Français" },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: "rgba(0,0,0,0.72)",
      backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <div style={{
        width: "min(480px, 100%)",
        background: "hsl(var(--card)/0.98)",
        backdropFilter: "blur(40px)",
        border: "1px solid hsl(var(--border)/0.5)",
        borderRadius: 22,
        overflow: "hidden",
        boxShadow: "0 0 0 1px hsl(152,72%,45%/0.18), 0 40px 120px rgba(0,0,0,0.6)",
      }}>
        {/* Accent line */}
        <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${green} 30%, ${amber} 70%, transparent)` }} />

        <div style={{ padding: "28px 28px 24px" }}>
          {/* Header */}
          <div style={{ marginBottom: 24, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 900, fontFamily: "var(--font-display)", letterSpacing: "-0.03em", marginBottom: 6 }}>
              DC <span style={{ color: green }}>ELO</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-display)", letterSpacing: "-0.02em", marginBottom: 4 }}>
              {t.welcome}
            </div>
            <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-body)" }}>
              {t.sub}
            </div>
          </div>

          {/* Region */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(var(--foreground))", marginBottom: 4 }}>
              {t.region_h}
            </div>
            <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-body)", marginBottom: 10 }}>
              {t.region_d}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {REGIONS.map(r => (
                <OptionBtn key={r.value} active={region === r.value} onClick={() => setRegion(r.value)} title={r.label}>
                  <span style={{ fontSize: 20, lineHeight: 1 }}>{r.flag}</span>
                </OptionBtn>
              ))}
            </div>
          </div>

          {/* Mode */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(var(--foreground))", marginBottom: 4 }}>
              {t.mode_h}
            </div>
            <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-body)", marginBottom: 10 }}>
              {t.mode_d}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {([["ELO", t.elo_d], ["DCPR", t.dcpr_d]] as const).map(([v, desc]) => (
                <OptionBtn key={v} active={mode === v} onClick={() => setMode(v)}>
                  <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 2 }}>{v}</div>
                  <div style={{ fontSize: 9 }}>{desc}</div>
                </OptionBtn>
              ))}
            </div>
          </div>

          {/* Language */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(var(--foreground))", marginBottom: 10 }}>
              {t.lang_h}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {LANGS.map(l => (
                <button key={l.value}
                  onClick={() => { setLang(l.value); setUiLang(l.value); }}
                  style={{
                    flex: 1, padding: "8px 6px", borderRadius: 10, border: "2px solid",
                    borderColor: lang === l.value ? green : "hsl(var(--border)/0.4)",
                    background: lang === l.value ? "hsl(152,72%,45%/0.12)" : "hsl(var(--muted)/0.3)",
                    color: lang === l.value ? green : "hsl(var(--muted-foreground))",
                    cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 11,
                    fontWeight: lang === l.value ? 700 : 400, textAlign: "center" as const,
                    transition: "all 0.15s",
                  }}>
                  <div style={{ fontSize: 18, marginBottom: 3 }}>{l.flag}</div>
                  <div>{l.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button onClick={submit} style={{
            width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
            background: `linear-gradient(135deg, ${green}, hsl(152,72%,35%))`,
            color: "#fff", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700,
            cursor: "pointer", letterSpacing: "0.04em",
            boxShadow: `0 4px 20px hsl(152,72%,45%/0.4)`,
          }}>
            {t.btn}
          </button>
        </div>
      </div>
    </div>
  );
}
