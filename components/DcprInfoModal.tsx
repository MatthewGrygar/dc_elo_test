"use client";

import { Zap, X, AlertTriangle, Building2 } from "lucide-react";

type Lang = "cs" | "en" | "fr";

const TEXT: Record<Lang, { title: string; full: string; desc: string; contact: string; noData: string; btn: string }> = {
  cs: {
    title:   "DCPR",
    full:    "Duel Commander Premier Rating",
    desc:    "Rating počítaný výhradně z velkých ligových turnajů. Je to kompetitivní bodový systém odrážející skutečnou dovednost hráče v těch největších a nejprestižnějších turnajích Duel Commanderu.",
    contact: "Máte zájem o začlenění vašeho turnaje nebo ligy do DCPR? Kontaktujte nás prosím v kartě Organizace.",
    noData:  "Ve vašem regionu zatím nemáme data z žádného ligového turnaje.",
    btn:     "Rozumím",
  },
  en: {
    title:   "DCPR",
    full:    "Duel Commander Premier Rating",
    desc:    "A rating calculated exclusively from major league tournaments. It's a competitive scoring system reflecting a player's true skill in the biggest and most prestigious Duel Commander events.",
    contact: "Interested in joining your tournament or league to DCPR? Please contact us in the Organization tab.",
    noData:  "We don't have data from any league tournament in your region yet.",
    btn:     "Got it",
  },
  fr: {
    title:   "DCPR",
    full:    "Duel Commander Premier Rating",
    desc:    "Un rating calculé exclusivement à partir des grands tournois ligués. Il s'agit d'un système de score compétitif reflétant la véritable compétence d'un joueur dans les événements Duel Commander les plus grands et les plus prestigieux.",
    contact: "Vous souhaitez intégrer votre tournoi ou ligue dans le DCPR ? Contactez-nous dans l'onglet Organisation.",
    noData:  "Dans votre région, nous n'avons pas encore de données issues de tournois ligués.",
    btn:     "Compris",
  },
};

interface Props {
  lang: Lang;
  region: string;
  onClose: () => void;
}

export default function DcprInfoModal({ lang, region, onClose }: Props) {
  const t     = TEXT[lang];
  const green = "hsl(152,72%,45%)";
  const amber = "hsl(42,80%,55%)";
  const purple = "hsl(262,70%,62%)";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2200,
      background: "rgba(0,0,0,0.70)",
      backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <div style={{
        width: "min(500px, 100%)",
        background: "hsl(var(--card)/0.98)",
        backdropFilter: "blur(40px)",
        border: "1px solid hsl(var(--border)/0.45)",
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: `0 0 0 1px ${purple}20, 0 0 80px -12px ${purple}30, 0 48px 140px rgba(0,0,0,0.6)`,
      }}>
        {/* Accent line */}
        <div style={{ height: 4, background: `linear-gradient(90deg, transparent, ${purple} 30%, ${amber} 70%, transparent)` }} />

        <div style={{ padding: "28px 28px 26px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 54, height: 54, borderRadius: 16, flexShrink: 0,
                background: `linear-gradient(135deg, ${purple}25, ${purple}10)`,
                border: `1px solid ${purple}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 28px -6px ${purple}55`,
              }}>
                <Zap size={24} style={{ color: purple }} />
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, fontFamily: "var(--font-display)", letterSpacing: "-0.04em", lineHeight: 1, color: purple }}>
                  {t.title}
                </div>
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", marginTop: 3, letterSpacing: "0.06em" }}>
                  {t.full}
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{
              width: 28, height: 28, borderRadius: 8, border: "1px solid hsl(var(--border))",
              background: "hsl(var(--muted)/0.5)", color: "hsl(var(--muted-foreground))",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
            }}>
              <X size={13} />
            </button>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, hsl(var(--border)/0.6), transparent)`, marginBottom: 18 }} />

          {/* Description */}
          <div style={{
            padding: "14px 16px", borderRadius: 12,
            background: `${purple}0a`, border: `1px solid ${purple}22`,
            fontSize: 14, lineHeight: 1.65, fontFamily: "var(--font-body)",
            color: "hsl(var(--foreground))", marginBottom: 12,
          }}>
            {t.desc}
          </div>

          {/* Contact */}
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            padding: "12px 14px", borderRadius: 12,
            background: `${amber}0a`, border: `1px solid ${amber}22`,
            marginBottom: lang === "fr" ? 12 : 22,
          }}>
            <Building2 size={15} style={{ color: amber, flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 13, lineHeight: 1.55, fontFamily: "var(--font-body)", color: "hsl(var(--foreground))" }}>
              {t.contact}
            </div>
          </div>

          {/* FR region warning — no DCPR data */}
          {region === "FR" && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "12px 14px", borderRadius: 12,
              background: "hsl(0,65%,55%,0.10)", border: "1px solid hsl(0,65%,55%,0.30)",
              marginBottom: 22,
            }}>
              <AlertTriangle size={15} style={{ color: "hsl(0,65%,60%)", flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 13, lineHeight: 1.55, fontFamily: "var(--font-body)", color: "hsl(var(--foreground))" }}>
                {t.noData}
              </div>
            </div>
          )}

          {/* Button */}
          <button onClick={onClose} style={{
            width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
            background: `linear-gradient(135deg, ${purple}, hsl(262,70%,50%))`,
            color: "#fff", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700,
            cursor: "pointer", letterSpacing: "0.05em",
            boxShadow: `0 6px 24px ${purple}45`,
            transition: "transform 0.12s, box-shadow 0.12s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {t.btn}
          </button>
        </div>
      </div>
    </div>
  );
}
