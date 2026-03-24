"use client";

import { useState } from "react";
import { useAppNav } from "./AppContext";
import { t } from "@/lib/i18n";
import {
  Newspaper, Clock, User, Trophy, TrendingUp,
  Megaphone, FileText, ChevronRight, Calendar, Tag,
} from "lucide-react";

type Category = "all" | "tournament" | "analysis" | "news" | "report";

interface Article {
  id: number;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  body?: Record<string, string>;
  category: Exclude<Category, "all">;
  tag: string;
  author: string;
  date: string;
  readTime: number;
  featured?: boolean;
}

// ── Real article from the screenshot + more placeholders ──────────────────────
const ARTICLES: Article[] = [
  {
    id: 1,
    title: {
      cs: "DCPR komise – organizační & metodický orgán projektu DC ELO",
      en: "DCPR Committee – Organisational & Methodological Body of DC ELO",
      fr: "Comité DCPR – Organe Organisationnel et Méthodologique du Projet DC ELO",
    },
    excerpt: {
      cs: "DCPR komise vznikla jako organizační a metodický orgán projektu DC ELO pro formát Duel Commander (MtG). Jejím cílem je dlouhodobě budovat stabilní, transparentní a férové kompetitivní prostředí pro hráče v České republice i v širším regionu.",
      en: "The DCPR committee was established as the organisational and methodological body of the DC ELO project for the Duel Commander (MtG) format. Its goal is to build a stable, transparent and fair competitive environment for players in the Czech Republic and the wider region.",
      fr: "Le comité DCPR a été créé en tant qu'organe organisationnel et méthodologique du projet DC ELO pour le format Duel Commander (MtG). Son objectif est de construire un environnement compétitif stable, transparent et équitable.",
    },
    category: "news",
    tag: "DCPR",
    author: "DCPR Komise",
    date: "2025-03-01",
    readTime: 6,
    featured: true,
  },
  {
    id: 2,
    title: {
      cs: "Jarní série 2025 – výsledky a analýza",
      en: "Spring Series 2025 – Results and Analysis",
      fr: "Série de Printemps 2025 – Résultats et Analyse",
    },
    excerpt: {
      cs: "Jarní série turnajů 2025 přinesla řadu překvapení. Podívejte se na výsledky, pohyby v žebříčku a analýzu nejzajímavějších zápasů celé série.",
      en: "The Spring 2025 tournament series brought many surprises. Check out the results, ranking movements and analysis of the most interesting matches.",
      fr: "La série de tournois du printemps 2025 a apporté de nombreuses surprises. Découvrez les résultats, les mouvements du classement et l'analyse des matchs.",
    },
    category: "tournament",
    tag: "Turnaj",
    author: "DC Admin",
    date: "2025-04-10",
    readTime: 8,
    featured: false,
  },
  {
    id: 3,
    title: {
      cs: "Analýza ELO inflace v DC formátu – 2025",
      en: "ELO Inflation Analysis in DC Format – 2025",
      fr: "Analyse de l'Inflation ELO dans le Format DC – 2025",
    },
    excerpt: {
      cs: "Jak se vyvíjí průměrné ELO komunity? Podrobná analýza trendů, inflace ratingu a zdraví celého systému za posledních 12 měsíců.",
      en: "How is the community's average ELO evolving? Detailed analysis of trends, rating inflation and system health over the last 12 months.",
      fr: "Comment évolue l'ELO moyen de la communauté ? Analyse détaillée des tendances, de l'inflation du classement et de la santé du système.",
    },
    category: "analysis",
    tag: "Analytika",
    author: "Data Team",
    date: "2025-03-22",
    readTime: 10,
    featured: false,
  },
  {
    id: 4,
    title: {
      cs: "Zimní liga 2024/25 – závěrečná zpráva",
      en: "Winter League 2024/25 – Final Report",
      fr: "Ligue d'Hiver 2024/25 – Rapport Final",
    },
    excerpt: {
      cs: "Zimní liga 2024/25 je za námi. Přinášíme kompletní zprávu: statistiky, pohyby v ratingu, nejlepší výkony a přehled všech odehraných turnajů.",
      en: "Winter League 2024/25 is behind us. We bring a complete report: statistics, rating movements, top performances and an overview of all tournaments played.",
      fr: "La ligue d'hiver 2024/25 est derrière nous. Rapport complet : statistiques, mouvements de classement, meilleures performances.",
    },
    category: "report",
    tag: "Zpráva",
    author: "DCPR Komise",
    date: "2025-02-28",
    readTime: 12,
    featured: false,
  },
  {
    id: 5,
    title: {
      cs: "Top 10 nejlepších zápasů DC komunity – rok 2024",
      en: "Top 10 Best Matches of the DC Community – 2024",
      fr: "Top 10 des Meilleurs Matchs de la Communauté DC – 2024",
    },
    excerpt: {
      cs: "Rekapitulujeme deset nejdramatičtějších a nejnapínavějších zápasů roku 2024. Epické duely, velká překvapení a historické momenty komunity.",
      en: "We recap the ten most dramatic and exciting matches of 2024. Epic duels, big upsets and historic moments for the community.",
      fr: "Nous résumons les dix matchs les plus dramatiques de 2024. Duels épiques, grandes surprises et moments historiques.",
    },
    category: "analysis",
    tag: "Best Of",
    author: "DC Analytics",
    date: "2025-01-15",
    readTime: 7,
    featured: false,
  },
  {
    id: 6,
    title: {
      cs: "Nová sezóna 2025 – změny pravidel a formátu",
      en: "New Season 2025 – Rule and Format Changes",
      fr: "Nouvelle Saison 2025 – Changements de Règles et de Format",
    },
    excerpt: {
      cs: "Co přináší sezóna 2025? Přehled všech změn pravidel, nových formátů turnajů a úprav hodnotícího systému, které vstoupí v platnost.",
      en: "What does the 2025 season bring? Overview of all rule changes, new tournament formats and rating system adjustments coming into effect.",
      fr: "Que réserve la saison 2025 ? Aperçu de tous les changements de règles, nouveaux formats de tournois et ajustements du système de classement.",
    },
    category: "news",
    tag: "Novinky",
    author: "DC Admin",
    date: "2025-01-02",
    readTime: 4,
    featured: false,
  },
];

const CAT_META: Record<Exclude<Category, "all">, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  tournament: { icon: Trophy,     color: "hsl(42,92%,52%)",  bg: "hsl(42 92% 52% / 0.12)",  border: "hsl(42 92% 52% / 0.3)"  },
  analysis:   { icon: TrendingUp, color: "hsl(152,72%,45%)", bg: "hsl(152 72% 45% / 0.12)", border: "hsl(152 72% 45% / 0.3)" },
  news:       { icon: Megaphone,  color: "hsl(195,78%,48%)", bg: "hsl(195 78% 48% / 0.12)", border: "hsl(195 78% 48% / 0.3)" },
  report:     { icon: FileText,   color: "hsl(265,65%,60%)", bg: "hsl(265 65% 60% / 0.12)", border: "hsl(265 65% 60% / 0.3)" },
};

function formatDate(dateStr: string, lang: string): string {
  const d = new Date(dateStr);
  if (lang === "cs") return d.toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" });
  if (lang === "fr") return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function ArticleCard({ article, featured }: { article: Article; featured?: boolean }) {
  const { lang } = useAppNav();
  const meta  = CAT_META[article.category];
  const Icon  = meta.icon;
  const title   = article.title[lang]   || article.title.cs;
  const excerpt = article.excerpt[lang] || article.excerpt.cs;

  return (
    <div
      className="article-hover shine"
      style={{
        position: "relative",
        borderRadius: featured ? 18 : 14,
        overflow: "hidden",
        cursor: "pointer",
        gridColumn: featured ? "1 / -1" : undefined,
      }}
    >
      {/* glass bg */}
      <div style={{
        position: "absolute", inset: 0,
        background: "hsl(var(--card) / 0.82)",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        border: `1px solid ${featured ? meta.border : "hsl(var(--card-border) / 0.85)"}`,
        borderRadius: featured ? 18 : 14,
      }} />
      {/* accent stripe */}
      {featured && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${meta.color}, transparent 60%)` }} />
      )}

      <div style={{ position: "relative", zIndex: 1, padding: featured ? "24px 26px" : "18px 20px" }}>
        {/* badges */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 10px", borderRadius: 99,
            background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color,
          }}>
            <Icon size={9} />
            <span style={{ fontSize: 9, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
              {article.tag}
            </span>
          </div>
          {featured && (
            <span style={{
              padding: "3px 10px", borderRadius: 99, fontSize: 9, fontWeight: 700,
              fontFamily: "var(--font-mono)", letterSpacing: "0.05em",
              background: "hsl(var(--primary) / 0.12)",
              border: "1px solid hsl(var(--primary) / 0.28)",
              color: "hsl(var(--primary))",
            }}>FEATURED</span>
          )}
        </div>

        {/* title */}
        <h3 style={{
          fontFamily: "var(--font-display)",
          fontSize: featured ? 20 : 14,
          fontWeight: 800, letterSpacing: "-0.025em",
          lineHeight: 1.25, marginBottom: 10,
          color: "hsl(var(--foreground))",
        }}>{title}</h3>

        {/* excerpt */}
        <p style={{
          fontSize: 12, lineHeight: 1.7,
          color: "hsl(var(--muted-foreground))",
          marginBottom: 14,
          display: "-webkit-box",
          WebkitLineClamp: featured ? 3 : 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        } as React.CSSProperties}>{excerpt}</p>

        {/* meta row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 10, color: "hsl(var(--muted-foreground))" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <User size={9} />{article.author}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Calendar size={9} />{formatDate(article.date, lang)}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
            <Clock size={9} />{article.readTime} {t(lang, "min_read")}
          </span>
          <ChevronRight size={11} color={meta.color} />
        </div>
      </div>
    </div>
  );
}

const CAT_TKEYS: Record<Category, string> = {
  all: "article_all", tournament: "article_tournament",
  analysis: "article_analysis", news: "article_news", report: "article_report",
};

export default function ArticlesView() {
  const { lang } = useAppNav();
  const [cat, setCat] = useState<Category>("all");

  const filtered = cat === "all" ? ARTICLES : ARTICLES.filter(a => a.category === cat);
  const featured = cat === "all" ? filtered.find(a => a.featured) : undefined;
  const rest     = filtered.filter(a => !a.featured || cat !== "all");

  const cats: { id: Category; icon: React.ElementType }[] = [
    { id: "all",        icon: Newspaper  },
    { id: "tournament", icon: Trophy     },
    { id: "analysis",   icon: TrendingUp },
    { id: "news",       icon: Megaphone  },
    { id: "report",     icon: FileText   },
  ];

  return (
    <div style={{ height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* header */}
      <div className="anim-slide-up s1">
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 2 }}>
          {t(lang, "articles")}
        </h2>
        <p style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
          {t(lang, "sub_articles")}
        </p>
      </div>

      {/* category filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} className="anim-slide-up s2">
        {cats.map(c => {
          const active = cat === c.id;
          const meta = c.id !== "all" ? CAT_META[c.id as Exclude<Category, "all">] : null;
          const col    = meta?.color  ?? "hsl(var(--primary))";
          const bg     = meta?.bg     ?? "hsl(var(--primary) / 0.12)";
          const border = meta?.border ?? "hsl(var(--primary) / 0.28)";
          const Icon   = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: 99,
                border: `1px solid ${active ? border : "hsl(var(--border))"}`,
                background: active ? bg : "hsl(var(--muted) / 0.4)",
                color: active ? col : "hsl(var(--muted-foreground))",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: "var(--font-body)", transition: "all .18s",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "hsl(var(--muted)/0.7)"; e.currentTarget.style.color = "hsl(var(--foreground))"; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "hsl(var(--muted)/0.4)"; e.currentTarget.style.color = "hsl(var(--muted-foreground))"; } }}
            >
              <Icon size={11} />
              {t(lang, CAT_TKEYS[c.id] as any)}
            </button>
          );
        })}
      </div>

      {/* featured */}
      {featured && (
        <div className="anim-slide-up s3">
          <ArticleCard article={featured} featured />
        </div>
      )}

      {/* grid */}
      <div
        className="anim-slide-up s4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 14,
          paddingBottom: 8,
        }}
      >
        {rest.map(a => <ArticleCard key={a.id} article={a} />)}
      </div>

      {filtered.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48, gap: 12 }}>
          <Newspaper size={32} color="hsl(var(--muted-foreground))" />
          <p style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>{t(lang, "no_data")}</p>
        </div>
      )}
    </div>
  );
}
