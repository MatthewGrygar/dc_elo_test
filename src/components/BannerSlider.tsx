import { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';

// Local placeholder assets (kept in repo for GH Pages/offline).
import slide1 from '../assets/slider/slide-1.png';
import slide2 from '../assets/slider/slide-2.png';
import slide3 from '../assets/slider/slide-3.png';

export type Slide = {
  title: string;
  subtitle: string;
  imageSrc: string;
};

type Props = {
  slides?: Slide[];
};

const DEFAULT_SLIDES: Slide[] = [
  {
    title: 'DC ELO 2.0',
    subtitle: 'Kompetitivní žebříček, statistiky a trendy pro Duel Commander (1v1).',
    imageSrc: slide1,
  },
  {
    title: 'Leaderboard jako datová platforma',
    subtitle: 'Data proudí z veřejného Google Sheet → jednoduchá správa, rychlé iterace.',
    imageSrc: slide2,
  },
  {
    title: 'Grafy a insighty',
    subtitle: 'Postupně přidáme vývoj ELO v čase, aktivitu a formu hráčů.',
    imageSrc: slide3,
  },
];

/**
 * BannerSlider (Hero)
 * -------------------
 * Minimalistický, prémiový hero slider:
 * - full width
 * - fade transition (400ms)
 * - jemný Ken Burns zoom (1 → 1.05 za ~7.5s)
 * - text dole vlevo
 */
export function BannerSlider({ slides }: Props) {
  const deck = useMemo(() => slides ?? DEFAULT_SLIDES, [slides]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % deck.length), 8000);
    return () => window.clearInterval(id);
  }, [deck.length]);

  return (
    <section className="hero glass-panel relative w-full">
      <div className="absolute inset-0">
        {deck.map((s, i) => (
          <div key={s.title} className={classNames('hero-slide', i === index && 'is-active')}>
            <img className="hero-image" src={s.imageSrc} alt="" loading={i === index ? 'eager' : 'lazy'} />
            <div className="hero-overlay" />
            <div className="hero-text">
              <h1 className="hero-title text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
                {s.title}
              </h1>
              <p className="hero-subtitle mt-2 max-w-2xl text-sm font-medium sm:text-base">
                {s.subtitle}
              </p>

              {/* Optional single CTA (kept minimal) */}
              <a
                href="#leaderboard"
                className="hero-cta mt-4 inline-flex items-center rounded-2xl border px-4 py-2 text-sm font-semibold backdrop-blur-sm transition"
              >
                Zobrazit leaderboard
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Dots (minimal, optional control) */}
      <div className="absolute bottom-5 right-5 flex items-center gap-2">
        {deck.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className={classNames(
              'h-2 w-2 rounded-full transition',
              i === index ? 'bg-white/90' : 'bg-white/35 hover:bg-white/55',
            )}
            aria-label={`Jít na slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
