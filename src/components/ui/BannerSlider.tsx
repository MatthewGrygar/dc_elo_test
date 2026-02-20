import { useEffect, useMemo, useState } from "react";

type Slide = {
  title: string;
  subtitle: string;
  meta: string;
};

const SLIDES: Slide[] = [
  {
    title: "Duel Commander ELO",
    subtitle: "Profesionální analytický přehled hráčů a výkonu.",
    meta: "v2.3 • dashboard",
  },
  {
    title: "Monochrome UI",
    subtitle: "Čistý SaaS/esport look. Barevné akcenty pouze pro data.",
    meta: "glass • premium",
  },
  {
    title: "Data z Google Sheets",
    subtitle: "Jednoduchá datová vrstva pro rychlou iteraci a automatizace.",
    meta: "sheet • gviz",
  },
];

export function BannerSlider({ dataSource }: { dataSource: "google-sheet" | "fallback" }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setIdx((v) => (v + 1) % SLIDES.length), 6000);
    return () => window.clearInterval(t);
  }, []);

  const slide = useMemo(() => SLIDES[idx], [idx]);

  return (
    <section className="banner panel" aria-label="Hero">
      <div className="bannerBg" aria-hidden />
      <img className="bannerImage" src="banner.svg" alt="" aria-hidden />
      <div className="bannerOverlay" aria-hidden />

      <div className="bannerInner">
        <div className="bannerTextWrap">
          <div className="chipRow">
            <span className="chip">{slide.meta}</span>
            <span className={`chip chip--${dataSource === "google-sheet" ? "ok" : "warn"}`}>
              {dataSource === "google-sheet" ? "Live data" : "Fallback data"}
            </span>
          </div>
          <h1 className="bannerTitle">{slide.title}</h1>
          <p className="bannerSubtitle">{slide.subtitle}</p>
        </div>

        <div className="bannerDots" role="tablist" aria-label="Slides">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === idx ? "dot--active" : ""}`}
              onClick={() => setIdx(i)}
              type="button"
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
