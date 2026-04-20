"use client";

import { useState, useEffect } from "react";
import { Heart, Share2, CalendarDays, MessageCircle, CheckCircle } from "lucide-react";

type Lang = "cs" | "en" | "fr";

const TEXT: Record<Lang, {
  title: string; sub: string;
  support: string; share: string; tournament: string; discord: string;
  footer: string; sign: string; btn: string;
}> = {
  cs: {
    title:      "Děkujeme vám!",
    sub:        "Jsme rádi, že jste tady.",
    support:    "Pokud nás chcete podpořit, najdete možnost v sekci Podpořit.",
    share:      "Největší podporou pro nás ale je sdílení projektu ve vaší komunitě — pomůžete nám tím nejvíc!",
    tournament: "Chcete, aby se váš turnaj zapojil do našeho systému? Určitě nás kontaktujte.",
    discord:    "Najdete nás také na našem Discordu.",
    footer:     "Moc vám děkujeme 🙏",
    sign:       "DCPR komise · Tým DC ELO",
    btn:        "Výborně, rozumím!",
  },
  en: {
    title:      "Thank you!",
    sub:        "We're glad you're here.",
    support:    "If you'd like to support us, you'll find the option in the Support section.",
    share:      "But the biggest support for us is sharing the project in your community — that helps us the most!",
    tournament: "Want your tournament to join our system? Don't hesitate to contact us.",
    discord:    "You can also find us on our Discord.",
    footer:     "Thank you so much 🙏",
    sign:       "DCPR Committee · DC ELO Team",
    btn:        "Got it, let's go!",
  },
  fr: {
    title:      "Merci !",
    sub:        "Nous sommes ravis de vous accueillir.",
    support:    "Si vous souhaitez nous soutenir, vous trouverez l'option dans la section Soutenir.",
    share:      "Mais le meilleur soutien pour nous est de partager le projet dans votre communauté — c'est ce qui nous aide le plus !",
    tournament: "Vous voulez que votre tournoi rejoigne notre système ? N'hésitez pas à nous contacter.",
    discord:    "Retrouvez-nous aussi sur notre Discord.",
    footer:     "Merci beaucoup 🙏",
    sign:       "Commission DCPR · Équipe DC ELO",
    btn:        "Parfait, c'est compris !",
  },
};

export default function ThankYouModal({ onDone }: { onDone: () => void }) {
  const [lang, setLang] = useState<Lang>("cs");

  useEffect(() => {
    try {
      const s = localStorage.getItem("dc-elo-lang") as Lang | null;
      if (s && (s === "cs" || s === "en" || s === "fr")) setLang(s);
    } catch {}
  }, []);

  const t = TEXT[lang];
  const green = "hsl(152,72%,45%)";
  const amber = "hsl(42,80%,55%)";
  const purple = "hsl(262,70%,62%)";

  const items = [
    { icon: Heart,         color: amber,  text: t.support    },
    { icon: Share2,        color: green,  text: t.share      },
    { icon: CalendarDays,  color: purple, text: t.tournament },
    { icon: MessageCircle, color: "hsl(200,70%,55%)", text: t.discord },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2100,
      background: "rgba(0,0,0,0.75)",
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
        boxShadow: `0 0 0 1px hsl(42,80%,55%/0.18), 0 40px 120px rgba(0,0,0,0.6)`,
      }}>
        {/* Accent line */}
        <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${green} 25%, ${amber} 75%, transparent)` }} />

        <div style={{ padding: "28px 28px 24px" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 22 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, margin: "0 auto 14px",
              background: `${amber}18`,
              border: `1px solid ${amber}35`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 24px -6px ${amber}55`,
            }}>
              <Heart size={24} style={{ color: amber }} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "var(--font-display)", letterSpacing: "-0.03em", marginBottom: 5 }}>
              {t.title}
            </div>
            <div style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-body)" }}>
              {t.sub}
            </div>
          </div>

          {/* Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
            {items.map(({ icon: Icon, color, text }, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "10px 12px", borderRadius: 12,
                background: `${color}0d`,
                border: `1px solid ${color}22`,
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: `${color}18`,
                }}>
                  <Icon size={14} style={{ color }} />
                </div>
                <div style={{ fontSize: 12, fontFamily: "var(--font-body)", color: "hsl(var(--foreground))", lineHeight: 1.55, paddingTop: 5 }}>
                  {text}
                </div>
              </div>
            ))}
          </div>

          {/* Footer sign */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontFamily: "var(--font-body)", color: "hsl(var(--muted-foreground))", marginBottom: 4 }}>
              {t.footer}
            </div>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: "hsl(var(--foreground))", letterSpacing: "0.04em" }}>
              {t.sign}
            </div>
          </div>

          {/* Button */}
          <button onClick={onDone} style={{
            width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
            background: `linear-gradient(135deg, ${amber}, hsl(42,80%,42%))`,
            color: "#000", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700,
            cursor: "pointer", letterSpacing: "0.04em",
            boxShadow: `0 4px 20px ${amber}50`,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <CheckCircle size={14} />
            {t.btn}
          </button>
        </div>
      </div>
    </div>
  );
}
