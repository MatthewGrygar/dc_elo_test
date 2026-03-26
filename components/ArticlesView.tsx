"use client";

import { useState } from "react";
import { useAppNav } from "./AppContext";
import { t } from "@/lib/i18n";
import {
  Newspaper, Clock, User, TrendingUp, ChevronLeft, Calendar,
} from "lucide-react";

type Section =
  | { type: "p";    text: string }
  | { type: "h2";   text: string }
  | { type: "code"; text: string }
  | { type: "ul";   items: string[] };

interface Article {
  id: number;
  title: { cs: string; en: string; fr: string };
  excerpt: { cs: string; en: string; fr: string };
  body: Section[];
  tag: string;
  author: string;
  date: string;
  readTime: number;
}

const ARTICLES: Article[] = [
  {
    id: 1,
    title: {
      cs: "Metodika hodnocení hráčů — DC ELO systém",
      en: "Player Rating Methodology — DC ELO System",
      fr: "Méthodologie de classement des joueurs — Système DC ELO",
    },
    excerpt: {
      cs: "V Duel Commander komunitě používáme systém hodnocení, jehož cílem je dlouhodobě, transparentně a konzistentně odhadovat výkonnost hráčů na základě skutečně odehraných matchů.",
      en: "In the Duel Commander community we use a rating system designed to estimate player performance consistently and transparently based on actually played matches.",
      fr: "Dans la communauté Duel Commander, nous utilisons un système de classement conçu pour estimer les performances des joueurs de manière cohérente et transparente sur la base des matchs réellement joués.",
    },
    tag: "Analytika",
    author: "DCPR Komise",
    date: "2025-03-01",
    readTime: 8,
    body: [
      { type: "p", text: "V Duel Commander komunitě používáme systém hodnocení, jehož cílem je dlouhodobě, transparentně a konzistentně odhadovat výkonnost hráčů na základě skutečně odehraných matchů. Základem je modifikovaný model Elo, doplněný o datově řízenou segmentaci hráčů do čtyř tříd (Class A–D)." },
      { type: "p", text: "Metodicky vycházíme z kalibrace používané v MTG Elo Project, která je navržena pro prostředí karetních her s vyšší variancí výsledků. Cílem není vytvořit agresivní žebříček s extrémními rozdíly, ale stabilní a realistický odhad relativní síly hráčů." },

      { type: "h2", text: "Elo jako průběžný odhad výkonnosti" },
      { type: "p", text: "Každý hráč vstupuje do systému s počátečním ratingem 1500 bodů. Rating se následně upravuje po každém odehraném matchi podle klasického Elo principu: změna je úměrná rozdílu mezi očekávaným a skutečným výsledkem." },
      { type: "p", text: "Použitý vývojový parametr je K = 36. Tento relativně vyšší faktor odráží skutečnost, že v komunitním prostředí je počet her na hráče omezený a variabilita výsledků vyšší než například v šachu." },

      { type: "h2", text: "Očekávané skóre" },
      { type: "code", text: "E = 1 / (1 + 10^((Rb − Ra) / 1135))" },
      { type: "p", text: "Klíčovým parametrem je konstanta 1135, která určuje 'plošnost' křivky očekávání. V praxi znamená, že rozdíl 200 ratingových bodů odpovídá přibližně 60% očekávané úspěšnosti silnějšího hráče. Oproti klasické šachové škále (400) je tedy model výrazně méně strmý. Tato volba reflektuje vyšší míru variance v karetních hrách (náhoda, matchupy, prostředí) a záměrně 'brzdí' význam ratingových rozdílů." },

      { type: "h2", text: "Aktualizace ratingu" },
      { type: "code", text: "R′ = R + K · (S − E)" },
      { type: "p", text: "S je skutečný výsledek: 1 (výhra), 0 (prohra), 0.5 (remíza). Interně jsou ratingy vedeny s desetinnou přesností, aby nedocházelo k systematickým zaokrouhlovacím chybám. Navenek zobrazujeme hodnoty zaokrouhlené na celé body." },

      { type: "h2", text: "Co se do modelu započítává — a co ne" },
      { type: "p", text: "Model pracuje výhradně s výsledkem matchu. Skóre 2–0 a 2–1 má z hlediska ratingu stejný dopad. Hodnotíme pouze win/loss/draw, nikoli margin vítězství. Tento přístup odpovídá původní filozofii Elo a zabraňuje nežádoucím efektům spojeným s 'optimalizací rozdílu skóre'." },
      { type: "ul", items: [
        "BYE nemá na rating žádný vliv.",
        "Nevalidní nebo neúplné záznamy se nezapočítávají.",
        "Rating reflektuje pouze skutečně odehrané head‑to‑head zápasy mezi dvěma hráči.",
      ]},

      { type: "h2", text: "Praktická interpretace ratingových rozdílů" },
      { type: "p", text: "Orientačně (díky konstantě 1135):" },
      { type: "ul", items: [
        "rozdíl 0 bodů → 50 % očekávání",
        "rozdíl ~100 bodů → 55 %",
        "rozdíl 200 bodů → 60 %",
        "rozdíl 300 bodů → ~65 %",
        "rozdíl 400 bodů → ~69 %",
      ]},
      { type: "p", text: "Zásadní je pochopení, že i rozdíl 200 bodů nepředstavuje dominanci, ale pouze mírnou až střední výhodu. To odpovídá charakteru karetní hry a je to vědomý designový cíl převzatý z MTG Elo Project." },

      { type: "h2", text: "Od spojitého ratingu k třídám A–D" },
      { type: "p", text: "Samotné Elo poskytuje spojitou metriku výkonnosti. Pro potřeby komunity je však užitečné doplnit ji o přehlednou segmentaci. Proto nad ratingem aplikujeme shlukovou analýzu pomocí algoritmu k‑means." },
      { type: "p", text: "Clustering se aplikuje pouze na hráče, kteří splňují dvě podmínky:" },
      { type: "ul", items: [
        "mají rating alespoň 1500,",
        "odehráli minimálně 10 her.",
      ]},
      { type: "p", text: "Používáme parametr k = 4 (čtyři clustery), které mapujeme na Class A (nejvyšší) až Class D (nejnižší v rámci filtrovaného souboru). Algoritmus minimalizuje součet čtverců vzdáleností hráčů od centroidů (inertia), takže třídy vznikají z přirozené struktury dat, nikoli podle předem daných hranic." },
      { type: "p", text: "Pozn.: k‑means může konvergovat do lokálního minima a výsledek závisí na inicializaci centroidů. Proto je vhodné použít více startů (např. n_init) a vybrat řešení s nejnižší hodnotou inertia." },

      { type: "h2", text: "Empirická struktura tříd" },
      { type: "p", text: "Při vizualizaci ratingů jsou obvykle patrná čtyři relativně zřetelná výšková pásma: Class A (typicky jen několik hráčů kolem ~1680), pod nimi kompaktní horní střed Class B (~1600–1640), střední pás Class C (~1540–1580) a nejnižší pás po filtru ≥1500 odpovídá třídě Class D (blízko ~1500–1520)." },
      { type: "p", text: "Důležité je, že hranice mezi třídami nejsou pevně definované konkrétním číslem. Vznikají emergentně z aktuálního rozložení ratingů v komunitě." },

      { type: "h2", text: "Provozní režim systému" },
      { type: "p", text: "Hodnocení i klasifikace jsou plně automatizované. Po každé aktualizaci nebo opravě dat:" },
      { type: "ul", items: [
        "se přepočítají všechny ratingy,",
        "následně se znovu provede clustering na kvalifikovaných hráčích.",
      ]},
      { type: "p", text: "Systém je tedy dynamický a reaguje na vývoj komunity v reálném čase." },

      { type: "h2", text: "Závěrečné shrnutí" },
      { type: "p", text: "Použitý model kombinuje modifikované Elo s plošší škálou očekávání a datově řízený k‑means clustering. Výsledkem je:" },
      { type: "ul", items: [
        "konzistentní odhad výkonnosti založený výhradně na odehraných zápasech,",
        "realistická interpretace ratingových rozdílů v prostředí karetní hry,",
        "přehledná segmentace hráčské základny bez arbitrárních hranic.",
      ]},
      { type: "p", text: "Jedná se o první systematickou verzi hodnocení, která je připravena k dalším metodologickým úpravám podle vývoje dat i potřeb komunity." },
    ],
  },
];

const accentColor = "hsl(152,72%,45%)";
const accentBg    = "hsl(152 72% 45% / 0.12)";
const accentBorder = "hsl(152 72% 45% / 0.3)";

function formatDate(dateStr: string, lang: "cs" | "en" | "fr"): string {
  const locale = lang === "en" ? "en-GB" : lang === "fr" ? "fr-FR" : "cs-CZ";
  return new Date(dateStr).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

function ArticleDetail({ article, onBack, lang }: { article: Article; onBack: () => void; lang: "cs" | "en" | "fr" }) {
  return (
    <div style={{ height: "100%", overflowY: "auto" }} className="scrollbar-thin">
      <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 0, paddingBottom: 32 }}>

        {/* Back button */}
        <button onClick={onBack}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20, padding: "6px 12px", borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--muted)/0.5)", color: "hsl(var(--muted-foreground))", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)", alignSelf: "flex-start" }}>
          <ChevronLeft size={13} />{t(lang, "art_back")}
        </button>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 99, background: accentBg, border: `1px solid ${accentBorder}`, color: accentColor, marginBottom: 14 }}>
            <TrendingUp size={9} />
            <span style={{ fontSize: 9, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>{article.tag}</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 900, letterSpacing: "-0.035em", lineHeight: 1.2, marginBottom: 14, color: "hsl(var(--foreground))" }}>{article.title[lang]}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 11, color: "hsl(var(--muted-foreground))" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><User size={10} />{article.author}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Calendar size={10} />{formatDate(article.date, lang)}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Clock size={10} />{article.readTime} {t(lang, "min_read")}</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {article.body.map((section, i) => {
            if (section.type === "h2") return (
              <h2 key={i} style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, letterSpacing: "-0.025em", color: "hsl(var(--foreground))", marginTop: 10, marginBottom: 2, paddingTop: 10, borderTop: "1px solid hsl(var(--border)/0.5)" }}>{section.text}</h2>
            );
            if (section.type === "p") return (
              <p key={i} style={{ fontSize: 13, lineHeight: 1.8, color: "hsl(var(--muted-foreground))", margin: 0 }}>{section.text}</p>
            );
            if (section.type === "code") return (
              <div key={i} style={{ padding: "12px 16px", borderRadius: 10, background: "hsl(var(--muted)/0.6)", border: "1px solid hsl(var(--border))", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: accentColor, letterSpacing: "0.02em" }}>{section.text}</div>
            );
            if (section.type === "ul") return (
              <ul key={i} style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                {section.items.map((item, j) => (
                  <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, lineHeight: 1.65, color: "hsl(var(--muted-foreground))" }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: accentColor, flexShrink: 0, marginTop: 7 }} />
                    {item}
                  </li>
                ))}
              </ul>
            );
            return null;
          })}
        </div>
      </div>
    </div>
  );
}

export default function ArticlesView() {
  const { lang } = useAppNav();
  const [selected, setSelected] = useState<Article | null>(null);

  if (selected) return <ArticleDetail article={selected} onBack={() => setSelected(null)} lang={lang} />;

  const article = ARTICLES[0];

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

      {/* single article card */}
      <div className="anim-slide-up s2" onClick={() => setSelected(article)}
        style={{ position: "relative", borderRadius: 18, overflow: "hidden", cursor: "pointer" }}>
        {/* glass bg */}
        <div style={{ position: "absolute", inset: 0, background: "hsl(var(--card) / 0.82)", backdropFilter: "blur(20px) saturate(160%)", WebkitBackdropFilter: "blur(20px) saturate(160%)", border: `1px solid ${accentBorder}`, borderRadius: 18 }} />
        {/* accent stripe */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accentColor}, transparent 60%)` }} />

        <div style={{ position: "relative", zIndex: 1, padding: "24px 26px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 99, background: accentBg, border: `1px solid ${accentBorder}`, color: accentColor }}>
              <TrendingUp size={9} />
              <span style={{ fontSize: 9, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>{article.tag}</span>
            </div>
            <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 9, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.05em", background: "hsl(var(--primary) / 0.12)", border: "1px solid hsl(var(--primary) / 0.28)", color: "hsl(var(--primary))" }}>{t(lang, "art_featured")}</span>
          </div>

          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.25, marginBottom: 10, color: "hsl(var(--foreground))" }}>{article.title[lang]}</h3>

          <p style={{ fontSize: 12, lineHeight: 1.7, color: "hsl(var(--muted-foreground))", marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>{article.excerpt[lang]}</p>

          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 10, color: "hsl(var(--muted-foreground))" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><User size={9} />{article.author}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={9} />{formatDate(article.date, lang)}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}><Clock size={9} />{article.readTime} {t(lang, "min_read")}</span>
            <span style={{ fontSize: 11, color: accentColor, fontWeight: 600 }}>{t(lang, "art_read")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
