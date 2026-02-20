import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Slide = {
  title: string;
  subtitle: string;
  kicker: string;
};

const SLIDES: Slide[] = [
  {
    kicker: 'Analytický dashboard',
    title: 'Duel Commander ELO',
    subtitle: 'Profesionální přehled hráčů, výkonu a trendů. Připravené pro další metagame moduly.',
  },
  {
    kicker: 'Nová verze 2.3',
    title: 'Glass UI & performance',
    subtitle: 'Decentní sklo, čisté grafy bez chaosu a rychlý leaderboard díky virtualizaci.',
  },
  {
    kicker: 'Data layer',
    title: 'Google Sheets jako zdroj',
    subtitle: 'Jednotný přepínač ELO/DCPR přepíná celý dashboard. Později doplníme match history.',
  },
];

export function BannerSlider() {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 6500);
    return () => window.clearInterval(id);
  }, []);

  const slide = SLIDES[index];

  return (
    <section className="banner panel" aria-label="Hero">
      <div className="bannerOrbs" aria-hidden="true" />
      <div className="bannerContent">
        <div className="bannerText">
          <div className="bannerKicker">{slide.kicker}</div>
          <h1 className="bannerTitle">{slide.title}</h1>
          <p className="bannerSubtitle">{slide.subtitle}</p>
        </div>

        <div className="bannerControls" aria-label="Ovládání slideru">
          <button
            className="iconBtn"
            type="button"
            onClick={() => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length)}
            aria-label="Předchozí slide"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="dots" aria-hidden="true">
            {SLIDES.map((_, i) => (
              <span key={i} className={i === index ? 'dot active' : 'dot'} />
            ))}
          </div>
          <button
            className="iconBtn"
            type="button"
            onClick={() => setIndex((i) => (i + 1) % SLIDES.length)}
            aria-label="Další slide"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
