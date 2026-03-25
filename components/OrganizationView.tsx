"use client";

import { useAppNav } from "./AppContext";
import { useEffect, useState, useRef, useCallback } from "react";
import { t } from "@/lib/i18n";
import {
  Zap, Users, Globe, Mail, MessageCircle, Youtube, Twitter,
  CheckCircle, ChevronRight, ExternalLink, MapPin, Calendar,
  Database, BarChart2, Network, Flame, Trophy, Send, Check,
} from "lucide-react";

// ── Card bez overflow:hidden – zabraňuje oříznutí obsahu ─────────────────────
function Card({
  children, style, accentColor,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  accentColor?: string;
}) {
  return (
    <div style={{
      borderRadius: 16,
      background: "hsl(var(--card))",
      border: `1px solid ${accentColor ? `${accentColor}35` : "hsl(var(--card-border))"}`,
      position: "relative",
      ...style,
    }}>
      {accentColor && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          borderRadius: "16px 16px 0 0",
          background: `linear-gradient(90deg, ${accentColor}, transparent 65%)`,
          pointerEvents: "none",
        }} />
      )}
      {children}
    </div>
  );
}

// ── News Carousel ─────────────────────────────────────────────────────────────
const SLIDES = [
  {
    img: "/slide1.png",
    title: "ZALOŽENÍ DCPR KOMISE",
    desc: "Zakládáme Komisi DCPR jako nezávislý orgán pro zajištění nestrannosti, transparentnosti a funkčnosti DC ELO systému a komunikaci s vedením lig napříč českou a zahraniční Duel Commander scénou.",
    action: "organization" as const,
    label: "Zjistit více",
  },
  {
    img: "/slide2.png",
    title: "JAK FUNGUJE VÝPOČET ELO?",
    desc: "Jak počítáme Elo a DCPR, proč právě tato kalibrace a jak vznikají třídy Rating Classy? To a mnohem víc se dozvíte v článku od tvůrce celého řešení.",
    action: "articles" as const,
    label: "Přečíst článek",
  },
  {
    img: "/slide3.png",
    title: "PODPOŘTE NÁS",
    desc: "DC ELO je komunitní projekt, který žije díky vám. Pokud se vám naše práce líbí a chcete nás podpořit, budeme moc rádi — každá pomoc nás motivuje projekt dál rozvíjet.",
    action: "support" as const,
    label: "Podpořit projekt",
  },
];

function NewsCarousel() {
  const { navigateTo, setSupportOpen } = useAppNav();
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((next: number) => {
    setFade(false);
    setTimeout(() => { setIdx(next); setFade(true); }, 180);
  }, []);

  const advance = useCallback(() => { setIdx(i => (i + 1) % SLIDES.length); }, []);

  useEffect(() => {
    timerRef.current = setInterval(advance, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [advance]);

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(advance, 5000);
  };

  const prev = (e: React.MouseEvent) => { e.stopPropagation(); goTo((idx - 1 + SLIDES.length) % SLIDES.length); reset(); };
  const next = (e: React.MouseEvent) => { e.stopPropagation(); goTo((idx + 1) % SLIDES.length); reset(); };

  const slide = SLIDES[idx];

  const handleAction = () => {
    if (slide.action === "support") { setSupportOpen(true); }
    else if (slide.action === "organization") { navigateTo("organization"); }
    else { navigateTo(slide.action); }
  };

  return (
    <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: "1px solid hsl(var(--border))", background: "hsl(var(--muted)/0.3)", userSelect: "none", cursor: "pointer" }} onClick={handleAction}>
      {/* Image */}
      <div style={{ position: "relative", width: "100%", paddingTop: "33.3%" }}>
        <img key={slide.img} src={slide.img} alt={slide.title}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: fade ? 1 : 0, transition: "opacity 0.18s ease" }} />
        {/* Dark gradient overlay for text */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, hsl(0 0% 0% / 0.72) 0%, hsl(0 0% 0% / 0.35) 55%, transparent 100%)" }} />
        {/* Text overlay */}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "20px 28px", opacity: fade ? 1 : 0, transition: "opacity 0.18s ease" }}>
          <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 700, letterSpacing: "0.18em", color: "hsl(var(--primary))", marginBottom: 7, textTransform: "uppercase" }}>{slide.title}</div>
          <p style={{ fontSize: 12, lineHeight: 1.65, color: "rgba(255,255,255,0.88)", maxWidth: 420, marginBottom: 14 }}>{slide.desc}</p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", fontSize: 11, fontWeight: 700, fontFamily: "var(--font-body)", alignSelf: "flex-start" }}>
            {slide.label} →
          </div>
        </div>
      </div>

      {/* Prev / Next */}
      <button onClick={prev} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: 7, background: "hsl(var(--background)/0.7)", border: "1px solid hsl(var(--border))", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "hsl(var(--foreground))", fontSize: 16, fontWeight: 700 }}>‹</button>
      <button onClick={next} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: 7, background: "hsl(var(--background)/0.7)", border: "1px solid hsl(var(--border))", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "hsl(var(--foreground))", fontSize: 16, fontWeight: 700 }}>›</button>

      {/* Dots */}
      <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
        {SLIDES.map((_, i) => (
          <button key={i} onClick={e => { e.stopPropagation(); goTo(i); reset(); }} style={{ width: i === idx ? 20 : 7, height: 7, borderRadius: 99, background: i === idx ? "hsl(var(--primary))" : "rgba(255,255,255,0.4)", border: "none", cursor: "pointer", transition: "all 0.25s ease", padding: 0 }} />
        ))}
      </div>
    </div>
  );
}

const TEAM = [
  {
    name: "Matthew Grygar", initials: "MG", photo: "/matthew_grygar.png",
    color: "hsl(152,72%,50%)", bg: "hsl(152 72% 50% / 0.15)", border: "hsl(152 72% 50% / 0.3)",
    roles: {
      cs: ["Předseda a zakladatel DCPR komise", "Spoluzakladatel Grail Series", "Spoluzakladatel ELO projektu"],
      en: ["Chairman and founder of DCPR committee", "Co-founder of Grail Series", "Co-founder of ELO project"],
      fr: ["Président et fondateur du comité DCPR", "Co-fondateur de Grail Series", "Co-fondateur du projet ELO"],
    },
    contact: "prague-dc-series@seznam.cz",
    badge: { cs: "Předseda komise", en: "Committee Chairman", fr: "Président du Comité" },
  },
  {
    name: "Ervin Kuč", initials: "EK",
    color: "hsl(195,78%,50%)", bg: "hsl(195 78% 50% / 0.15)", border: "hsl(195 78% 50% / 0.3)",
    roles: {
      cs: ["Člen DCPR komise", "Spoluzakladatel Grail Series", "Spoluzakladatel ELO projektu", "Architekt datového řešení DC ELO"],
      en: ["Member of DCPR committee", "Co-founder of Grail Series", "Co-founder of ELO project", "Data architecture of DC ELO"],
      fr: ["Membre du comité DCPR", "Co-fondateur de Grail Series", "Co-fondateur du projet ELO", "Architecture des données DC ELO"],
    },
    contact: null, photo: "/ervin_kuc.png",
    badge: { cs: "Člen komise & Data Architect", en: "Member & Data Architect", fr: "Membre & Architecte Données" },
  },
];

const ACTIVITIES = [
  { icon: Zap,      color: "hsl(152,72%,50%)", bg: "hsl(152 72% 50% / 0.12)", title: { cs: "Správa projektu DC ELO", en: "DC ELO Project Management", fr: "Gestion du Projet DC ELO" }, desc: { cs: "Komise zastřešuje celý ELO systém sledující dlouhodobou výkonnost hráčů napříč zapojenými turnaji. Dbáme na správnost výpočtů, transparentnost dat a jejich pravidelnou aktualizaci.", en: "The committee oversees the entire ELO system tracking long-term player performance across all participating tournaments. We ensure calculation accuracy, data transparency and regular updates.", fr: "Le comité supervise l'ensemble du système ELO qui suit les performances à long terme des joueurs dans les tournois participants." } },
  { icon: Trophy,   color: "hsl(42,92%,52%)",  bg: "hsl(42 92% 52% / 0.12)",  title: { cs: "DCPR žebříček", en: "DCPR Rankings", fr: "Classement DCPR" }, desc: { cs: "Vedle lifetime ELO spravujeme také DCPR hodnocení, které je založeno pouze na výsledcích z vybraných velkých turnajů. Slouží jako ukazatel aktuální výkonnosti na nejvyšší kompetitivní úrovni.", en: "In addition to lifetime ELO we manage DCPR ratings based only on results from selected major tournaments — an indicator of current performance at the highest competitive level.", fr: "En plus de l'ELO à vie, nous gérons le classement DCPR basé uniquement sur les résultats des grands tournois sélectionnés." } },
  { icon: Network,  color: "hsl(195,78%,50%)", bg: "hsl(195 78% 50% / 0.12)", title: { cs: "Komunikace s organizátory", en: "Communication with Organisers", fr: "Communication avec les Organisateurs" }, desc: { cs: "Aktivně spolupracujeme s pořadateli Duel Commander akcí. Pomáháme se začleněním turnajů do ELO systému, nastavujeme metodiku reportování výsledků a zajišťujeme jednotné standardy.", en: "We actively work with Duel Commander event organisers, help integrate tournaments into the ELO system, set up result reporting methodology and ensure uniform standards.", fr: "Nous collaborons activement avec les organisateurs d'événements Duel Commander pour intégrer les tournois dans le système ELO." } },
  { icon: Database, color: "hsl(265,65%,60%)", bg: "hsl(265 65% 60% / 0.12)", title: { cs: "Sběr a správa hráčských dat", en: "Player Data Management", fr: "Gestion des Données" }, desc: { cs: "Zajišťujeme evidenci výsledků, správu databáze hráčů a kontrolu správnosti nahlášených dat. Transparentnost a důvěryhodnost systému je pro nás klíčová.", en: "We ensure result records, player database management and verification of reported data. Transparency and system trustworthiness are key for us.", fr: "Nous assurons la tenue des résultats, la gestion de la base de données des joueurs et la vérification des données." } },
  { icon: BarChart2, color: "hsl(0,70%,58%)",  bg: "hsl(0 70% 58% / 0.12)",   title: { cs: "Monitoring kompetitivního prostředí", en: "Competitive Environment Monitoring", fr: "Surveillance de l'Environnement Compétitif" }, desc: { cs: "Sledujeme vývoj metagame, účast na turnajích i celkový stav komunity. Naším cílem je podporovat zdravé a vyvážené soutěžní prostředí.", en: "We monitor meta-game development, tournament attendance and overall community health. Our goal is to support a healthy and balanced competitive environment.", fr: "Nous surveillons l'évolution du métagame, la participation aux tournois et l'état général de la communauté." } },
  { icon: Flame,    color: "hsl(24,88%,56%)",  bg: "hsl(24 88% 56% / 0.12)",  title: { cs: "Budoucí rozvoj a speciální akce", en: "Future Development & Special Events", fr: "Développement Futur et Événements Spéciaux" }, desc: { cs: "Do budoucna plánujeme organizaci akcí pro hráče s určitým ELO ratingem, výkonnostní turnaje a další formáty, které podpoří růst komunity i motivaci hráčů.", en: "We plan to organise events for players with specific ELO ratings, performance tournaments and other formats supporting community growth and player motivation.", fr: "Nous prévoyons d'organiser des événements pour les joueurs avec un classement ELO spécifique et d'autres formats." } },
  { icon: Globe,    color: "hsl(195,78%,50%)", bg: "hsl(195 78% 50% / 0.12)", title: { cs: "Mezinárodní spolupráce", en: "International Cooperation", fr: "Coopération Internationale" }, desc: { cs: "Komunikujeme se zahraničními organizátory a komunitami Duel Commanderu s cílem sdílet zkušenosti, sjednocovat standardy a do budoucna propojovat hráčské základny napříč regiony.", en: "We communicate with foreign Duel Commander organisers and communities to share experience, unify standards and connect player bases across regions.", fr: "Nous communiquons avec des organisateurs étrangers de Duel Commander pour partager des expériences et unifier les standards." } },
];

const SOCIAL = [
  { icon: MessageCircle, label: "Discord",  color: "hsl(235,86%,65%)", bg: "hsl(235 86% 65% / 0.12)", handle: "DC ELO Server",             url: "#" },
  { icon: Youtube,       label: "YouTube",  color: "hsl(0,85%,55%)",   bg: "hsl(0 85% 55% / 0.10)",   handle: "@dcelo",                     url: "#" },
  { icon: Twitter,       label: "Twitter",  color: "hsl(199,89%,48%)", bg: "hsl(199 89% 48% / 0.10)", handle: "@dc_elo",                    url: "#" },
  { icon: Mail,          label: "E-mail",   color: "hsl(152,72%,45%)", bg: "hsl(152 72% 45% / 0.12)", handle: "prague-dc-series@seznam.cz", url: "mailto:prague-dc-series@seznam.cz" },
];

function MemberCard({ member }: { member: typeof TEAM[0] }) {
  const { lang } = useAppNav();
  const roles = member.roles[lang as keyof typeof member.roles] || member.roles.cs;
  const badge = member.badge[lang as keyof typeof member.badge] || member.badge.cs;
  return (
    <div style={{ borderRadius: 16, background: "hsl(var(--card))", border: `1px solid ${member.border}`, transition: "transform .22s, box-shadow .22s", position: "relative", overflow: "hidden" }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-4px)"; el.style.boxShadow = `0 20px 48px -8px ${member.color}28`; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "none"; el.style.boxShadow = "none"; }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${member.color}, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ padding: 22, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ width: 96, height: 96, borderRadius: 22, overflow: "hidden", border: `2px solid ${member.border}`, background: member.bg, flexShrink: 0, position: "relative" }}>
          {(member as any).photo && (
            <img src={(member as any).photo} alt={member.name}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }} />
          )}
          {!(member as any).photo && (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 900, color: member.color, fontFamily: "var(--font-display)", letterSpacing: "-0.04em" }}>{member.initials}</div>
          )}
        </div>
        <div style={{ textAlign: "center" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6, color: "hsl(var(--foreground))" }}>{member.name}</h3>
          <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 99, background: member.bg, border: `1px solid ${member.border}`, color: member.color, fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>{badge}</span>
        </div>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
          {roles.map((role, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
              <CheckCircle size={12} color={member.color} style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.45, color: "hsl(var(--foreground))" }}>{role}</span>
            </div>
          ))}
        </div>
        {member.contact && (
          <a href={`mailto:${member.contact}`} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 10, width: "100%", background: member.bg, border: `1px solid ${member.border}`, color: member.color, fontSize: 11, fontWeight: 600, textDecoration: "none" }}>
            <Mail size={12} />{member.contact}
          </a>
        )}
      </div>
    </div>
  );
}

function ContactForm({ subject }: { subject?: string }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [errMsg, setErrMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, subject: subject ?? "Zpráva z DC ELO" }),
      });
      if (res.ok) {
        setStatus("ok");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrMsg(data.error ?? `HTTP ${res.status}`);
        setStatus("err");
      }
    } catch (e: any) {
      setErrMsg(e?.message ?? "Network error");
      setStatus("err");
    }
  };

  if (status === "ok") {
    return (
      <div style={{ textAlign: "center", padding: "32px 16px" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "hsl(142,65%,45%,0.12)", border: "1px solid hsl(142,65%,45%,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
          <Check size={24} style={{ color: "hsl(142,65%,45%)" }} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)", marginBottom: 6 }}>Zpráva odeslána!</div>
        <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>Ozveme se ti co nejdříve na uvedený e-mail.</div>
      </div>
    );
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 13px", borderRadius: 10,
    border: "1px solid hsl(var(--border))",
    background: "hsl(var(--background))",
    color: "hsl(var(--foreground))",
    fontSize: 13, fontFamily: "var(--font-body)",
    outline: "none", boxSizing: "border-box",
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", letterSpacing: "0.08em", display: "block", marginBottom: 5 }}>JMÉNO *</label>
          <input required style={inp} placeholder="Jan Novák" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", letterSpacing: "0.08em", display: "block", marginBottom: 5 }}>E-MAIL *</label>
          <input required type="email" style={inp} placeholder="jan@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>
      </div>
      <div>
        <label style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", letterSpacing: "0.08em", display: "block", marginBottom: 5 }}>TELEFON</label>
        <input style={inp} placeholder="+420 000 000 000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
      </div>
      <div>
        <label style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", letterSpacing: "0.08em", display: "block", marginBottom: 5 }}>ZPRÁVA *</label>
        <textarea required rows={5} style={{ ...inp, resize: "vertical", minHeight: 100 }} placeholder="Napiš nám..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
      </div>
      {status === "err" && (
        <div style={{ fontSize: 11, color: "hsl(0,65%,55%)", fontFamily: "var(--font-mono)" }}>Chyba: {errMsg || "Odeslání selhalo"}</div>
      )}
      <button type="submit" disabled={status === "sending"}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 22px", borderRadius: 10, background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", border: "none", fontSize: 13, fontWeight: 700, cursor: status === "sending" ? "wait" : "pointer", opacity: status === "sending" ? 0.7 : 1, fontFamily: "var(--font-body)", alignSelf: "flex-start" as const }}>
        <Send size={13} />{status === "sending" ? "Odesílám…" : "Odeslat zprávu"}
      </button>
    </form>
  );
}

export default function OrganizationView() {
  const { lang, orgTab, setOrgTab } = useAppNav();
  const introText = {
    cs: "DCPR komise vznikla jako organizační a metodický orgán projektu DC ELO pro formát Duel Commander (MtG). Jejím cílem je dlouhodobě budovat stabilní, transparentní a férové kompetitivní prostředí pro hráče v České republice i v širším mezinárodním prostředí a aktivně se snažit o rozšíření projektu napříč jednotlivými zeměmi, kde se Duel Commander hraje.",
    en: "The DCPR Committee was established as the organisational and methodological body of the DC ELO project for the Duel Commander (MtG) format. Its goal is to build a stable, transparent and fair competitive environment for players in the Czech Republic and the wider region.",
    fr: "Le Comité DCPR a été créé en tant qu'organe organisationnel et méthodologique du projet DC ELO pour le format Duel Commander (MtG). Son objectif est de construire un environnement compétitif stable, transparent et équitable.",
  };

  return (
    <div style={{ height: "100%", overflowY: "auto" }} className="scrollbar-thin">
      <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingBottom: 24 }}>

        {/* Nadpis */}
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 2, color: "hsl(var(--foreground))" }}>{t(lang, "organization")}</h2>
          <p style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginBottom: 14 }}>{t(lang, "sub_organization")}</p>
        </div>

        {/* ── TAB: SPOLUPRÁCE ── */}
        {orgTab === "spoluprace" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Card accentColor="hsl(195,78%,50%)" style={{ padding: "26px 28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: "hsl(195 78% 50% / 0.12)", border: "1px solid hsl(195 78% 50% / 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Users size={18} style={{ color: "hsl(195,78%,50%)" }} />
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em", margin: 0, color: "hsl(var(--foreground))" }}>
                    {lang === "en" ? "Want to work with us?" : lang === "fr" ? "Envie de collaborer ?" : "Chcete s námi spolupracovat?"}
                  </h3>
                </div>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.78, color: "hsl(var(--foreground))", marginBottom: 0 }}>
                {lang === "en"
                  ? "We are open to any form of cooperation — whether you want to join your tournament into the DC ELO system, become a partner organisation, help with the project's development, join the DCPR committee, or simply share your ideas with us."
                  : lang === "fr"
                  ? "Nous sommes ouverts à toute forme de coopération — que vous souhaitiez intégrer votre tournoi dans le système DC ELO, devenir une organisation partenaire, aider au développement du projet, rejoindre le comité DCPR ou simplement partager vos idées."
                  : "Jsme otevřeni jakékoli formě spolupráce — ať už chcete zapojit svůj turnaj do systému DC ELO, stát se partnerskou organizací, pomoci s rozvojem projektu, chcete se stát součástí DCPR komise, nebo se s námi prostě podělit o své nápady."}
              </p>
            </Card>

            <Card style={{ padding: "24px 26px" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 20, display: "flex", alignItems: "center", gap: 8, color: "hsl(var(--foreground))" }}>
                <Send size={14} style={{ color: "hsl(var(--primary))" }} />
                {lang === "en" ? "Contact form" : lang === "fr" ? "Formulaire de contact" : "Kontaktní formulář"}
              </h3>
              <ContactForm subject="Spolupráce — DC ELO organizace" />
            </Card>
          </div>
        )}

        {/* ── TAB: O NÁS ── */}
        {orgTab === "about" && (<>

        {/* Hero */}
        <Card accentColor="hsl(152,72%,50%)">
          <div style={{ padding: "24px 26px 0" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: "hsl(var(--primary))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 8px 24px hsl(var(--primary) / 0.38)" }}>
                <Trophy size={26} color="hsl(var(--primary-foreground))" strokeWidth={2} />
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 4, color: "hsl(var(--foreground))" }}>
                  DC <span style={{ color: "hsl(var(--primary))" }}>ELO</span>
                </div>
                <div style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>
                  DCPR Komise · Czech Republic · Duel Commander MtG
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.72, color: "hsl(var(--muted-foreground))", maxWidth: 560 }}>
                  {introText[lang as keyof typeof introText] || introText.cs}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { icon: MapPin, text: "Czech Republic" },
                  { icon: Calendar, text: lang === "fr" ? "Fondée 2022" : lang === "en" ? "Est. 2022" : "Od roku 2022" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 99, background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", fontSize: 11, color: "hsl(var(--muted-foreground))" }}>
                    <Icon size={9} />{text}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: "1px solid hsl(var(--border))" }}>
            {[
              { val: "450+", lbl: lang === "en" ? "Active Players" : lang === "fr" ? "Joueurs Actifs" : "Aktivní hráči", col: "hsl(152,72%,50%)" },
              { val: "150+", lbl: lang === "en" ? "Tournaments"    : lang === "fr" ? "Tournois"       : "Turnaje",        col: "hsl(42,92%,52%)"  },
              { val: "2",    lbl: lang === "en" ? "Rating Systems" : lang === "fr" ? "Systèmes"       : "Rating systémy", col: "hsl(195,78%,50%)" },
              { val: "2025", lbl: lang === "en" ? "Founded"        : lang === "fr" ? "Fondée"         : "Rok vzniku",     col: "hsl(265,65%,60%)" },
            ].map(({ val, lbl, col }, i, arr) => (
              <div key={lbl} style={{ padding: "14px 12px", textAlign: "center", borderRight: i < arr.length - 1 ? "1px solid hsl(var(--border))" : "none" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, letterSpacing: "-0.04em", color: col, lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Carousel */}
        <NewsCarousel />

        {/* Tým */}
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 14, color: "hsl(var(--foreground))" }}>{t(lang, "org_team")}</h3>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
            {TEAM.map(m => (
              <div key={m.name} style={{ flex: "1 1 270px", maxWidth: 380 }}>
                <MemberCard member={m} />
              </div>
            ))}
          </div>
        </div>

        {/* Hlavní činnosti */}
        <Card style={{ padding: "22px 24px" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 18, display: "flex", alignItems: "center", gap: 8, color: "hsl(var(--foreground))" }}>
            <Zap size={15} color="hsl(var(--primary))" />
            {t(lang, "org_activities")}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
            {ACTIVITIES.map((act, i) => {
              const Icon = act.icon;
              const title = act.title[lang as keyof typeof act.title] || act.title.cs;
              const desc = act.desc[lang as keyof typeof act.desc] || act.desc.cs;
              return (
                <div key={i} style={{ display: "flex", gap: 14, padding: 16, borderRadius: 12, background: act.bg, border: `1px solid ${act.color}25` }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: "hsl(var(--card))", border: `1px solid ${act.color}35`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={16} color={act.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, fontFamily: "var(--font-display)", letterSpacing: "-0.01em", color: "hsl(var(--foreground))" }}>{title}</div>
                    <div style={{ fontSize: 12, lineHeight: 1.65, color: "hsl(var(--muted-foreground))" }}>{desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Spolupráce */}
        <Card accentColor="hsl(195,78%,50%)" style={{ padding: "22px 24px" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 12, display: "flex", alignItems: "center", gap: 8, color: "hsl(var(--foreground))" }}>
            <Users size={15} color="hsl(195,78%,50%)" />
            {t(lang, "org_cooperation")}
          </h3>
          <p style={{ fontSize: 13, lineHeight: 1.75, color: "hsl(var(--muted-foreground))", marginBottom: 16 }}>
            {lang === "en"
              ? "We are open to any form of cooperation — whether you want to join your tournament into the DC ELO system, become a partner organisation, help with the project's development, join the DCPR committee, or simply share your ideas with us."
              : lang === "fr"
              ? "Nous sommes ouverts à toute forme de coopération — que vous souhaitiez intégrer votre tournoi dans le système DC ELO, devenir une organisation partenaire, aider au développement du projet, rejoindre le comité DCPR ou simplement partager vos idées."
              : "Jsme otevřeni jakékoli formě spolupráce — ať už chcete zapojit svůj turnaj do systému DC ELO, stát se partnerskou organizací, pomoci s rozvojem projektu, chcete se stát součástí DCPR komise, nebo se s námi prostě podělit o své nápady."}
          </p>
          <button onClick={() => setOrgTab("spoluprace")}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 10, background: "hsl(195,78%,50%,0.12)", border: "1px solid hsl(195,78%,50%,0.3)", color: "hsl(195,78%,50%)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)" }}>
            {lang === "en" ? "More about cooperation" : lang === "fr" ? "En savoir plus" : "Více o spolupráci"}
            <ChevronRight size={13} />
          </button>
        </Card>


        </>)}

      </div>
    </div>
  );
}
