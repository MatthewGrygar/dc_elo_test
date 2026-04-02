"use client";

import { useState, useEffect } from "react";
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
  id: string;
  title: { cs: string; en: string; fr: string };
  excerpt: { cs: string; en: string; fr: string };
  body: Section[];
  tag: string;
  author: string;
  date: string;
  readTime: number;
  image?: string;
  inSlider?: boolean;
  published?: boolean;
}

const accentColor  = "hsl(152,72%,45%)";
const accentBg     = "hsl(152 72% 45% / 0.12)";
const accentBorder = "hsl(152 72% 45% / 0.3)";

function formatDate(dateStr: string, lang: "cs" | "en" | "fr"): string {
  const locale = lang === "en" ? "en-GB" : lang === "fr" ? "fr-FR" : "cs-CZ";
  return new Date(dateStr).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

function ArticleDetail({ article, onBack, lang }: { article: Article; onBack: () => void; lang: "cs" | "en" | "fr" }) {
  return (
    <div style={{ height: "100%", overflowY: "auto" }} className="scrollbar-thin">
      <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 0, paddingBottom: 32 }}>

        <button onClick={onBack}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20, padding: "6px 12px", borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--muted)/0.5)", color: "hsl(var(--muted-foreground))", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)", alignSelf: "flex-start" }}>
          <ChevronLeft size={13} />{t(lang, "art_back")}
        </button>

        {article.image && (
          <div style={{ marginBottom: 24, borderRadius: 14, overflow: "hidden", border: "1px solid hsl(var(--border))" }}>
            <img src={article.image} alt={article.title[lang]} style={{ width: "100%", maxHeight: 320, objectFit: "cover", display: "block" }} />
          </div>
        )}

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

function ArticleCard({ article, lang, onClick }: { article: Article; lang: "cs" | "en" | "fr"; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ position: "relative", borderRadius: 18, overflow: "hidden", cursor: "pointer" }}>
      <div style={{ position: "absolute", inset: 0, background: "hsl(var(--card) / 0.82)", backdropFilter: "blur(20px) saturate(160%)", WebkitBackdropFilter: "blur(20px) saturate(160%)", border: `1px solid ${accentBorder}`, borderRadius: 18 }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accentColor}, transparent 60%)` }} />

      {article.image && (
        <div style={{ position: "relative", height: 160, overflow: "hidden" }}>
          <img src={article.image} alt={article.title[lang]} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
      )}

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
  );
}

export default function ArticlesView() {
  const { lang } = useAppNav();
  const [selected, setSelected] = useState<Article | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/articles")
      .then((r) => r.json())
      .then((data) => { setArticles(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (selected) return <ArticleDetail article={selected} onBack={() => setSelected(null)} lang={lang} />;

  return (
    <div style={{ height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="anim-slide-up s1">
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 2 }}>
          {t(lang, "articles")}
        </h2>
        <p style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
          {t(lang, "sub_articles")}
        </p>
      </div>

      {loading ? (
        <div style={{ padding: "2rem", textAlign: "center", fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
          Načítám…
        </div>
      ) : articles.length === 0 ? (
        <div style={{ padding: "2rem", textAlign: "center", fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
          Žádné články.
        </div>
      ) : (
        <div className="anim-slide-up s2" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} lang={lang} onClick={() => setSelected(a)} />
          ))}
        </div>
      )}
    </div>
  );
}
