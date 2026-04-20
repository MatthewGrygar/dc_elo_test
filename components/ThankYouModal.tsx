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
    share:      "Největší podporou pro nás je sdílení projektu ve vaší komunitě — pomůžete nám tím nejvíc!",
    tournament: "Chcete, aby se váš turnaj zapojil do systému? Určitě nás kontaktujte.",
    discord:    "Najdete nás také na našem Discordu.",
    footer:     "Moc vám děkujeme 🙏",
    sign:       "DCPR komise · Tým DC ELO",
    btn:        "Výborně, rozumím!",
  },
  en: {
    title:      "Thank you!",
    sub:        "We're glad you're here.",
    support:    "If you'd like to support us, find the option in the Support section.",
    share:      "But the biggest support is sharing the project with your community — that helps us the most!",
    tournament: "Want your tournament in our system? Don't hesitate to reach out.",
    discord:    "You can also find us on our Discord.",
    footer:     "Thank you so much 🙏",
    sign:       "DCPR Committee · DC ELO Team",
    btn:        "Got it, let's go!",
  },
  fr: {
    title:      "Merci !",
    sub:        "Nous sommes ravis de vous accueillir.",
    support:    "Pour nous soutenir, retrouvez l'option dans la section Soutenir.",
    share:      "Mais le meilleur soutien est de partager le projet dans votre communauté — c'est ce qui nous aide le plus !",
    tournament: "Votre tournoi dans notre système ? N'hésitez pas à nous contacter.",
    discord:    "Retrouvez-nous aussi sur notre Discord.",
    footer:     "Merci beaucoup 🙏",
    sign:       "Commission DCPR · Équipe DC ELO",
    btn:        "Parfait, c'est compris !",
  },
};

export default function ThankYouModal({ onDone }: { onDone: () => void }) {
  const [lang, setLang]       = useState<Lang>("cs");
  const [mobile, setMobile]   = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem("dc-elo-lang") as Lang | null;
      if (s === "cs" || s === "en" || s === "fr") setLang(s);
    } catch {}
    const check = () => setMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const t      = TEXT[lang];
  const green  = "hsl(152,72%,45%)";
  const amber  = "hsl(42,80%,55%)";
  const purple = "hsl(262,70%,62%)";
  const blue   = "hsl(200,70%,55%)";

  const items = [
    { icon: Heart,         color: amber,  text: t.support    },
    { icon: Share2,        color: green,  text: t.share      },
    { icon: CalendarDays,  color: purple, text: t.tournament },
    { icon: MessageCircle, color: blue,   text: t.discord    },
  ];

  /* ── Mobile layout ── */
  if (mobile) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 2100,
        background: "rgba(0,0,0,0.80)",
        backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px 14px",
      }}>
        <div style={{
          width: "100%", maxWidth: 380,
          background: "hsl(var(--card)/0.99)",
          border: "1px solid hsl(var(--border)/0.5)",
          borderRadius: 18, overflow: "hidden",
          boxShadow: `0 0 0 1px ${amber}22, 0 24px 80px rgba(0,0,0,0.55)`,
        }}>
          <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${green} 25%, ${amber} 75%, transparent)` }} />
          <div style={{ padding: "18px 18px 16px" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${amber}18`, border: `1px solid ${amber}35`, boxShadow: `0 0 16px -4px ${amber}55` }}>
                <Heart size={18} style={{ color: amber }} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, fontFamily: "var(--font-display)", letterSpacing: "-0.03em", lineHeight: 1.1 }}>{t.title}</div>
                <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-body)", marginTop: 2 }}>{t.sub}</div>
              </div>
            </div>
            {/* Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 14 }}>
              {items.map(({ icon: Icon, color, text }, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, background: `${color}0d`, border: `1px solid ${color}22` }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${color}1a` }}>
                    <Icon size={12} style={{ color }} />
                  </div>
                  <div style={{ fontSize: 12, fontFamily: "var(--font-body)", color: "hsl(var(--foreground))", lineHeight: 1.45 }}>{text}</div>
                </div>
              ))}
            </div>
            {/* Footer */}
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginBottom: 2 }}>{t.footer}</div>
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 700, letterSpacing: "0.04em" }}>{t.sign}</div>
            </div>
            <button onClick={onDone} style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${amber}, hsl(42,80%,40%))`, color: "#000", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "0.04em", boxShadow: `0 4px 18px ${amber}45`, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
              <CheckCircle size={13} />{t.btn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Desktop layout ── */
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2100,
      background: "rgba(0,0,0,0.72)",
      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        width: "min(540px, 100%)",
        background: "hsl(var(--card)/0.97)",
        backdropFilter: "blur(40px)",
        border: "1px solid hsl(var(--border)/0.4)",
        borderRadius: 26,
        overflow: "hidden",
        boxShadow: `0 0 0 1px ${amber}20, 0 0 80px -10px ${amber}25, 0 48px 140px rgba(0,0,0,0.65)`,
      }}>
        {/* Top gradient bar */}
        <div style={{ height: 4, background: `linear-gradient(90deg, transparent 0%, ${green} 20%, ${amber} 55%, ${purple} 80%, transparent 100%)` }} />

        {/* Hero header with ambient glow */}
        <div style={{ position: "relative", padding: "36px 36px 28px", textAlign: "center", overflow: "hidden" }}>
          {/* Background glow blobs */}
          <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 320, height: 180, borderRadius: "50%", background: `radial-gradient(circle, ${amber}18 0%, transparent 70%)`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 10, left: "15%", width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${green}12 0%, transparent 70%)`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 10, right: "15%", width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${purple}12 0%, transparent 70%)`, pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20, margin: "0 auto 18px",
              background: `linear-gradient(135deg, ${amber}25, ${amber}10)`,
              border: `1px solid ${amber}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 32px -6px ${amber}60, 0 8px 24px rgba(0,0,0,0.2)`,
            }}>
              <Heart size={28} style={{ color: amber }} />
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, fontFamily: "var(--font-display)", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 8 }}>
              {t.title}
            </div>
            <div style={{ fontSize: 15, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-body)" }}>
              {t.sub}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, hsl(var(--border)/0.6), transparent)`, margin: "0 36px" }} />

        {/* Items grid — 2 columns */}
        <div style={{ padding: "24px 36px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {items.map(({ icon: Icon, color, text }, i) => (
            <div key={i} style={{
              padding: "14px 14px",
              borderRadius: 14,
              background: `${color}0c`,
              border: `1px solid ${color}28`,
              display: "flex", flexDirection: "column", gap: 10,
              boxShadow: `0 0 20px -8px ${color}30`,
              transition: "transform 0.15s",
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: `${color}1e`, border: `1px solid ${color}30`, boxShadow: `0 0 12px -3px ${color}40` }}>
                <Icon size={15} style={{ color }} />
              </div>
              <div style={{ fontSize: 13, fontFamily: "var(--font-body)", color: "hsl(var(--foreground))", lineHeight: 1.55 }}>
                {text}
              </div>
            </div>
          ))}
        </div>

        {/* Footer + button */}
        <div style={{ padding: "22px 36px 30px" }}>
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <div style={{ fontSize: 15, fontFamily: "var(--font-body)", color: "hsl(var(--muted-foreground))", marginBottom: 5 }}>
              {t.footer}
            </div>
            <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 700, color: "hsl(var(--foreground))", letterSpacing: "0.06em" }}>
              {t.sign}
            </div>
          </div>

          <button onClick={onDone} style={{
            width: "100%", padding: "15px 0", borderRadius: 14, border: "none",
            background: `linear-gradient(135deg, ${amber} 0%, hsl(38,85%,48%) 100%)`,
            color: "#000", fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 800,
            cursor: "pointer", letterSpacing: "0.05em",
            boxShadow: `0 6px 28px ${amber}55, 0 2px 8px rgba(0,0,0,0.25)`,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
            transition: "transform 0.12s, box-shadow 0.12s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 10px 36px ${amber}65, 0 2px 8px rgba(0,0,0,0.25)`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = `0 6px 28px ${amber}55, 0 2px 8px rgba(0,0,0,0.25)`; }}
          >
            <CheckCircle size={16} />
            {t.btn}
          </button>
        </div>
      </div>
    </div>
  );
}
