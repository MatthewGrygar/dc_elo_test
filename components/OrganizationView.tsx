"use client";

import { useAppNav } from "./AppContext";
import { t } from "@/lib/i18n";
import {
  Zap, Users, Globe, Mail, MessageCircle, Youtube, Twitter,
  CheckCircle, ChevronRight, ExternalLink, MapPin, Calendar,
  Database, BarChart2, Network, Flame, Trophy,
} from "lucide-react";

// ── Shared glass panel ────────────────────────────────────────────────────────
function Panel({
  children, style, accentColor, className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  accentColor?: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        position: "relative", borderRadius: 16, overflow: "hidden",
        background: "hsl(var(--card))",
        border: `1px solid ${accentColor ? `${accentColor}35` : "hsl(var(--card-border))"}`,
        ...style,
      }}
    >
      {accentColor && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2, zIndex: 1,
          background: `linear-gradient(90deg, ${accentColor}, transparent 65%)`,
        }} />
      )}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

// ── Real team ─────────────────────────────────────────────────────────────────
const TEAM = [
  {
    name: "Matthew Grygar",
    initials: "MG",
    color: "hsl(152,72%,50%)",
    bg: "hsl(152 72% 50% / 0.15)",
    border: "hsl(152 72% 50% / 0.3)",
    roles: {
      cs: ["Předseda a zakladatel DCPR komise", "Spoluzakladatel Grail Series", "Spoluzakladatel ELO projektu"],
      en: ["Chairman and founder of DCPR committee", "Co-founder of Grail Series", "Co-founder of ELO project"],
      fr: ["Président et fondateur du comité DCPR", "Co-fondateur de Grail Series", "Co-fondateur du projet ELO"],
    },
    contact: "prague-dc-series@seznam.cz",
    badge: { cs: "Předseda komise", en: "Committee Chairman", fr: "Président du Comité" },
  },
  {
    name: "Ervin Kuč",
    initials: "EK",
    color: "hsl(195,78%,50%)",
    bg: "hsl(195 78% 50% / 0.15)",
    border: "hsl(195 78% 50% / 0.3)",
    roles: {
      cs: ["Člen DCPR komise", "Spoluzakladatel Grail Series", "Spoluzakladatel ELO projektu", "Architekt datového řešení DC ELO"],
      en: ["Member of DCPR committee", "Co-founder of Grail Series", "Co-founder of ELO project", "Data architecture of DC ELO"],
      fr: ["Membre du comité DCPR", "Co-fondateur de Grail Series", "Co-fondateur du projet ELO", "Architecture des données DC ELO"],
    },
    contact: null,
    badge: { cs: "Člen komise & Data Architect", en: "Member & Data Architect", fr: "Membre & Architecte Données" },
  },
];

// ── Activities — exact text from komise.txt ───────────────────────────────────
const ACTIVITIES = [
  {
    icon: Zap, color: "hsl(152,72%,50%)", bg: "hsl(152 72% 50% / 0.14)",
    title: { cs: "Správa projektu DC ELO", en: "DC ELO Project Management", fr: "Gestion du Projet DC ELO" },
    desc: {
      cs: "Komise zastřešuje celý ELO systém, který sleduje dlouhodobou (lifetime) výkonnost hráčů napříč zapojenými turnaji. Dbáme na správnost výpočtů, transparentnost dat a jejich pravidelnou aktualizaci.",
      en: "The committee oversees the entire ELO system tracking long-term (lifetime) player performance across all participating tournaments. We ensure calculation accuracy, data transparency and regular updates.",
      fr: "Le comité supervise l'ensemble du système ELO qui suit les performances à long terme des joueurs dans les tournois participants.",
    },
  },
  {
    icon: Trophy, color: "hsl(42,92%,52%)", bg: "hsl(42 92% 52% / 0.14)",
    title: { cs: "DCPR žebříček", en: "DCPR Rankings", fr: "Classement DCPR" },
    desc: {
      cs: "Vedle lifetime ELO spravujeme také DCPR hodnocení, které je založeno pouze na výsledcích z vybraných velkých turnajů. Tento žebříček slouží jako ukazatel aktuální výkonnosti hráčů na nejvyšší kompetitivní úrovni.",
      en: "In addition to lifetime ELO we manage DCPR ratings, based only on results from selected major tournaments — an indicator of current performance at the highest competitive level.",
      fr: "En plus de l'ELO à vie, nous gérons le classement DCPR, basé uniquement sur les résultats des grands tournois sélectionnés.",
    },
  },
  {
    icon: Network, color: "hsl(195,78%,50%)", bg: "hsl(195 78% 50% / 0.14)",
    title: { cs: "Komunikace s organizátory lig a turnajů", en: "Communication with Organisers", fr: "Communication avec les Organisateurs" },
    desc: {
      cs: "Aktivně spolupracujeme s pořadateli Duel Commander akcí. Pomáháme se začleněním turnajů do ELO systému, nastavujeme metodiku reportování výsledků a zajišťujeme jednotné standardy.",
      en: "We actively work with Duel Commander event organisers, help integrate tournaments into the ELO system, set up result reporting methodology and ensure uniform standards.",
      fr: "Nous collaborons activement avec les organisateurs d'événements Duel Commander pour intégrer les tournois dans le système ELO.",
    },
  },
  {
    icon: Database, color: "hsl(265,65%,60%)", bg: "hsl(265 65% 60% / 0.14)",
    title: { cs: "Sběr a správa hráčských dat", en: "Collection and Management of Player Data", fr: "Collecte et Gestion des Données" },
    desc: {
      cs: "Zajišťujeme evidenci výsledků, správu databáze hráčů a kontrolu správnosti nahlášených dat. Transparentnost a důvěryhodnost systému je pro nás klíčová.",
      en: "We ensure result records, player database management and verification of reported data. Transparency and system trustworthiness are key for us.",
      fr: "Nous assurons la tenue des résultats, la gestion de la base de données des joueurs et la vérification des données.",
    },
  },
  {
    icon: BarChart2, color: "hsl(0,70%,58%)", bg: "hsl(0 70% 58% / 0.14)",
    title: { cs: "Monitoring kompetitivního prostředí", en: "Competitive Environment Monitoring", fr: "Surveillance de l'Environnement Compétitif" },
    desc: {
      cs: "Sledujeme vývoj metagame, účast na turnajích i celkový stav komunity. Naším cílem je podporovat zdravé a vyvážené soutěžní prostředí.",
      en: "We monitor meta-game development, tournament attendance and overall community health. Our goal is to support a healthy and balanced competitive environment.",
      fr: "Nous surveillons l'évolution du métagame, la participation aux tournois et l'état général de la communauté.",
    },
  },
  {
    icon: Flame, color: "hsl(24,88%,56%)", bg: "hsl(24 88% 56% / 0.14)",
    title: { cs: "Budoucí rozvoj a speciální akce", en: "Future Development and Special Events", fr: "Développement Futur et Événements Spéciaux" },
    desc: {
      cs: "Do budoucna plánujeme organizaci akcí pro hráče s určitým ELO ratingem, výkonnostní turnaje a další formáty, které podpoří růst komunity i motivaci hráčů.",
      en: "We plan to organise events for players with specific ELO ratings, performance tournaments and other formats supporting community growth and player motivation.",
      fr: "Nous prévoyons d'organiser des événements pour les joueurs avec un classement ELO spécifique et d'autres formats.",
    },
  },
  {
    icon: Globe, color: "hsl(195,78%,50%)", bg: "hsl(195 78% 50% / 0.14)",
    title: { cs: "Mezinárodní spolupráce", en: "International Cooperation", fr: "Coopération Internationale" },
    desc: {
      cs: "Komunikujeme se zahraničními organizátory a komunitami Duel Commanderu s cílem sdílet zkušenosti, sjednocovat standardy a do budoucna propojovat hráčské základny napříč regiony.",
      en: "We communicate with foreign Duel Commander organisers and communities to share experience, unify standards and connect player bases across regions.",
      fr: "Nous communiquons avec des organisateurs étrangers de Duel Commander pour partager des expériences et unifier les standards.",
    },
  },
];

const SOCIAL = [
  { icon: MessageCircle, label: "Discord",  color: "hsl(235,86%,65%)", bg: "hsl(235 86% 65% / 0.12)", handle: "DC ELO Server",             url: "#" },
  { icon: Youtube,       label: "YouTube",  color: "hsl(0,85%,55%)",   bg: "hsl(0 85% 55% / 0.10)",   handle: "@dcelo",                     url: "#" },
  { icon: Twitter,       label: "Twitter",  color: "hsl(199,89%,48%)", bg: "hsl(199 89% 48% / 0.10)", handle: "@dc_elo",                    url: "#" },
  { icon: Mail,          label: "E-mail",   color: "hsl(152,72%,45%)", bg: "hsl(152 72% 45% / 0.12)", handle: "prague-dc-series@seznam.cz", url: "mailto:prague-dc-series@seznam.cz" },
];

// ── Member Card ───────────────────────────────────────────────────────────────
function MemberCard({ member }: { member: typeof TEAM[0] }) {
  const { lang } = useAppNav();
  const roles = member.roles[lang as keyof typeof member.roles] || member.roles.cs;
  const badge = member.badge[lang as keyof typeof member.badge] || member.badge.cs;

  return (
    <div
      style={{
        borderRadius: 16, overflow: "hidden", cursor: "default",
        background: "hsl(var(--card))",
        border: `1px solid ${member.border}`,
        transition: "transform .22s, box-shadow .22s",
        position: "relative",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(-4px)";
        el.style.boxShadow = `0 20px 48px -8px ${member.color}28`;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "none";
        el.style.boxShadow = "none";
      }}
    >
      {/* top accent line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${member.color}, transparent 70%)` }} />

      <div style={{ padding: 22, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        {/* Avatar */}
        <div style={{
          width: 96, height: 96, borderRadius: 20,
          background: member.bg,
          border: `2px solid ${member.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32, fontWeight: 900,
          color: member.color,
          fontFamily: "var(--font-display)", letterSpacing: "-0.04em",
        }}>
          {member.initials}
        </div>

        {/* Name */}
        <div style={{ textAlign: "center" }}>
          <h3 style={{
            fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800,
            letterSpacing: "-0.03em", marginBottom: 6,
            color: "hsl(var(--foreground))",
          }}>
            {member.name}
          </h3>
          <span style={{
            display: "inline-block", padding: "3px 12px", borderRadius: 99,
            background: member.bg,
            border: `1px solid ${member.border}`,
            color: member.color,
            fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.05em",
          }}>
            {badge}
          </span>
        </div>

        {/* Roles */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
          {roles.map((role, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
              <CheckCircle size={12} color={member.color} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.45, color: "hsl(var(--foreground))" }}>{role}</span>
            </div>
          ))}
        </div>

        {/* Contact */}
        {member.contact && (
          <a
            href={`mailto:${member.contact}`}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 14px", borderRadius: 10, width: "100%",
              background: member.bg,
              border: `1px solid ${member.border}`,
              color: member.color,
              fontSize: 11, fontWeight: 600, textDecoration: "none",
              transition: "background .18s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = `${member.color}20`)}
            onMouseLeave={e => (e.currentTarget.style.background = member.bg)}
          >
            <Mail size={12} />{member.contact}
          </a>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function OrganizationView() {
  const { lang } = useAppNav();

  const introText = {
    cs: "DCPR komise vznikla jako organizační a metodický orgán projektu DC ELO pro formát Duel Commander (MtG). Jejím cílem je dlouhodobě budovat stabilní, transparentní a férové kompetitivní prostředí pro hráče v České republice i v širším regionu.",
    en: "The DCPR Committee was established as the organisational and methodological body of the DC ELO project for the Duel Commander (MtG) format. Its goal is to build a stable, transparent and fair competitive environment for players in the Czech Republic and the wider region.",
    fr: "Le Comité DCPR a été créé en tant qu'organe organisationnel et méthodologique du projet DC ELO pour le format Duel Commander (MtG). Son objectif est de construire un environnement compétitif stable, transparent et équitable.",
  };

  return (
    <div style={{ height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Header */}
      <div className="anim-slide-up s1">
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 2, color: "hsl(var(--foreground))" }}>
          {t(lang, "organization")}
        </h2>
        <p style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
          {t(lang, "sub_organization")}
        </p>
      </div>

      {/* ── Hero ── */}
      <Panel accentColor="hsl(152,72%,50%)" className="anim-slide-up s2">
        <div style={{ padding: "24px 26px 0" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
            {/* Logo */}
            <div style={{
              width: 60, height: 60, borderRadius: 16,
              background: "hsl(var(--primary))",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 8px 24px hsl(var(--primary) / 0.38)",
            }}>
              <Zap size={28} color="hsl(var(--primary-foreground))" strokeWidth={2.2} />
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{
                fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 900,
                letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 4,
                color: "hsl(var(--foreground))",
              }}>
                DC <span style={{ color: "hsl(var(--primary))" }}>ELO</span>
              </div>
              <div style={{
                fontSize: 9, color: "hsl(var(--muted-foreground))",
                fontFamily: "var(--font-mono)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10,
              }}>
                DCPR Komise · Czech Republic · Duel Commander MtG
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.72, color: "hsl(var(--muted-foreground))", maxWidth: 560 }}>
                {introText[lang as keyof typeof introText] || introText.cs}
              </p>
            </div>

            {/* Chips */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { icon: MapPin, text: "Czech Republic" },
                { icon: Calendar, text: lang === "fr" ? "Fondée 2022" : lang === "en" ? "Est. 2022" : "Od roku 2022" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "4px 11px", borderRadius: 99,
                  background: "hsl(var(--muted))",
                  border: "1px solid hsl(var(--border))",
                  fontSize: 11, color: "hsl(var(--muted-foreground))",
                }}>
                  <Icon size={9} />{text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: "1px solid hsl(var(--border))" }}>
          {[
            { val: "50+",  lbl: lang === "en" ? "Active Players" : lang === "fr" ? "Joueurs Actifs" : "Aktivní hráči", col: "hsl(152,72%,50%)" },
            { val: "24",   lbl: lang === "en" ? "Tournaments"    : lang === "fr" ? "Tournois"       : "Turnaje",        col: "hsl(42,92%,52%)"  },
            { val: "2",    lbl: lang === "en" ? "Rating Systems" : lang === "fr" ? "Systèmes"       : "Rating systémy", col: "hsl(195,78%,50%)" },
            { val: "2022", lbl: lang === "en" ? "Founded"        : lang === "fr" ? "Fondée"         : "Rok vzniku",     col: "hsl(265,65%,60%)" },
          ].map(({ val, lbl, col }, i, arr) => (
            <div key={lbl} style={{
              padding: "14px 12px", textAlign: "center",
              borderRight: i < arr.length - 1 ? "1px solid hsl(var(--border))" : "none",
            }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, letterSpacing: "-0.04em", color: col, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </Panel>

      {/* ── Team ── */}
      <div className="anim-slide-up s3">
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 14, color: "hsl(var(--foreground))" }}>
          {t(lang, "org_team")}
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 16 }}>
          {TEAM.map(m => <MemberCard key={m.name} member={m} />)}
        </div>
      </div>

      {/* ── Activities ── */}
      <Panel style={{ padding: "22px 24px" }} className="anim-slide-up s4">
        <h3 style={{
          fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800,
          letterSpacing: "-0.025em", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 8,
          color: "hsl(var(--foreground))",
        }}>
          <Zap size={15} color="hsl(var(--primary))" />
          {t(lang, "org_activities")}
        </h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: 1,
        }}>
          {ACTIVITIES.map((act, i) => {
            const Icon  = act.icon;
            const title = act.title[lang as keyof typeof act.title] || act.title.cs;
            const desc  = act.desc[lang as keyof typeof act.desc]   || act.desc.cs;
            return (
              <div
                key={i}
                style={{
                  display: "flex", gap: 14,
                  padding: "16px",
                  borderRadius: 12,
                  background: act.bg,
                  border: `1px solid ${act.color}20`,
                  margin: 4,
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: "hsl(var(--card))",
                  border: `1px solid ${act.color}35`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={16} color={act.color} />
                </div>
                <div>
                  <div style={{
                    fontSize: 13, fontWeight: 700, marginBottom: 5,
                    fontFamily: "var(--font-display)", letterSpacing: "-0.01em",
                    color: "hsl(var(--foreground))",
                  }}>
                    {title}
                  </div>
                  <div style={{
                    fontSize: 12, lineHeight: 1.65,
                    color: "hsl(var(--muted-foreground))",
                  }}>
                    {desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* ── Cooperation ── */}
      <Panel accentColor="hsl(195,78%,50%)" style={{ padding: "22px 24px" }} className="anim-slide-up s5">
        <h3 style={{
          fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800,
          letterSpacing: "-0.025em", marginBottom: 14,
          display: "flex", alignItems: "center", gap: 8,
          color: "hsl(var(--foreground))",
        }}>
          <Users size={15} color="hsl(195,78%,50%)" />
          {t(lang, "org_cooperation")}
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "start" }}>
          <div>
            <p style={{ fontSize: 13, lineHeight: 1.75, color: "hsl(var(--foreground))", marginBottom: 10 }}>
              {lang === "en"
                ? "Are you interested in working with us, joining your tournament into the DC ELO system, or becoming a member of our organisation?"
                : lang === "fr"
                ? "Êtes-vous intéressé à collaborer avec nous, à rejoindre votre tournoi dans le système DC ELO, ou à devenir membre de notre organisation ?"
                : "Máte zájem s námi spolupracovat, zapojit svůj turnaj do systému DC ELO, nebo se stát členem naší organizace?"}
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: "hsl(var(--muted-foreground))", marginBottom: 4 }}>
              {lang === "en" ? "Contact us:" : lang === "fr" ? "Contactez-nous :" : "Neváhejte nás kontaktovat na e-mailu:"}
            </p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--primary))", fontFamily: "var(--font-mono)", marginBottom: 10 }}>
              prague-dc-series@seznam.cz
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.75, color: "hsl(var(--muted-foreground))" }}>
              {lang === "en"
                ? "We will be happy to discuss collaboration opportunities and further development of the Duel Commander scene."
                : lang === "fr"
                ? "Nous serons heureux de discuter des possibilités de coopération et du développement de la scène Duel Commander."
                : "Rádi s vámi probereme možnosti spolupráce a dalšího rozvoje Duel Commander scény."}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 200 }}>
            <a
              href="mailto:prague-dc-series@seznam.cz"
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 10,
                background: "hsl(var(--primary) / 0.10)", border: "1px solid hsl(var(--primary) / 0.30)",
                color: "hsl(var(--primary))", textDecoration: "none", fontSize: 13, fontWeight: 600,
                transition: "background .18s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--primary) / 0.20)")}
              onMouseLeave={e => (e.currentTarget.style.background = "hsl(var(--primary) / 0.10)")}
            >
              <Mail size={14} />
              {lang === "en" ? "Send email" : lang === "fr" ? "Envoyer un e-mail" : "Napsat email"}
              <ChevronRight size={12} style={{ marginLeft: "auto" }} />
            </a>
            <a
              href="#"
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 10,
                background: "hsl(235,86%,65%,0.12)", border: "1px solid hsl(235,86%,65%,0.30)",
                color: "hsl(235,86%,65%)", textDecoration: "none", fontSize: 13, fontWeight: 600,
              }}
            >
              <MessageCircle size={14} />
              Discord
              <ChevronRight size={12} style={{ marginLeft: "auto" }} />
            </a>
          </div>
        </div>
      </Panel>

      {/* ── Social ── */}
      <div className="anim-slide-up s6" style={{ paddingBottom: 8 }}>
        <h3 style={{
          fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800,
          letterSpacing: "-0.025em", marginBottom: 12, color: "hsl(var(--foreground))",
        }}>
          {lang === "en" ? "Follow us" : lang === "fr" ? "Suivez-nous" : "Sledujte nás"}
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: 10 }}>
          {SOCIAL.map((s, i) => {
            const Icon = s.icon;
            return (
              <a
                key={i}
                href={s.url}
                target={s.url.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                  borderRadius: 12,
                  background: s.bg,
                  border: `1px solid ${s.color}30`,
                  color: s.color, textDecoration: "none", transition: "all .18s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${s.color}20`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = s.bg; }}
              >
                <Icon size={16} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.label}</div>
                  <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{s.handle}</div>
                </div>
                <ExternalLink size={9} style={{ marginLeft: "auto", opacity: 0.5, color: s.color }} />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
