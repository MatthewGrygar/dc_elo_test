import React from 'react';

type Slide = {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
};

const SLIDES: Slide[] = [
  {
    id: 'intro',
    title: 'Duel Commander ELO',
    subtitle: 'Profesionalní analytický přehled hráčů a výkonu — rychle, čistě, přehledně.',
    cta: 'Explore Dashboard'
  },
  {
    id: 'meta',
    title: 'Premium dashboard feel',
    subtitle: 'Monochrome UI, glass panels, and data-first visuals. Ready for future sections.',
    cta: 'View Leaderboard'
  }
];

export function BannerSlider() {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 6500);
    return () => window.clearInterval(t);
  }, []);

  const slide = SLIDES[index]!;

  return (
    <section className="banner" aria-label="Hero">
      <div className="bannerInner panel">
        <div className="bannerGlow" aria-hidden />
        <div className="bannerGrid" aria-hidden />

        <div className="bannerTextWrap">
          <div className="chip">NEW · DC ELO 2.0 · v2.3</div>
          <h1 className="bannerTitle">{slide.title}</h1>
          <p className="bannerSubtitle">{slide.subtitle}</p>

          <div className="bannerActions">
            <a className="btn btn--primary" href={index === 0 ? '#dashboard' : '#leaderboard'}>
              {slide.cta}
            </a>
            <a className="btn btn--ghost" href="#leaderboard">
              Latest standings
            </a>
          </div>

          <div className="bannerDots" role="tablist" aria-label="Slides">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                className={i === index ? 'dot isActive' : 'dot'}
                onClick={() => setIndex(i)}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="bannerStatRail" aria-label="Highlights">
          <BannerStat label="Update" value="Live from Sheet" hint="No backend" />
          <BannerStat label="UI" value="Glass panels" hint="Light + Dark" />
          <BannerStat label="Charts" value="Placeholder" hint="Recharts" />
        </div>
      </div>
    </section>
  );
}

function BannerStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="bannerStat panel panel--soft">
      <div className="bannerStatLabel">{label}</div>
      <div className="bannerStatValue">{value}</div>
      <div className="bannerStatHint muted">{hint}</div>
    </div>
  );
}
