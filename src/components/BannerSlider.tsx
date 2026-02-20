import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import classNames from 'classnames';
import { GlassPanel } from './ui/GlassPanel';

// Local placeholder assets (v0):
// We keep them inside the repo so the banner works offline and on GitHub Pages.
import slide1 from '../assets/slider/slide-1.png';
import slide2 from '../assets/slider/slide-2.png';
import slide3 from '../assets/slider/slide-3.png';

export type Slide = {
  title: string;
  subtitle: string;
  hint?: string;
  imageSrc?: string;
};

type Props = {
  slides?: Slide[];
};

const DEFAULT_SLIDES: Slide[] = [
  {
    title: 'DC ELO 2.0',
    subtitle: 'Nová generace žebříčku s rychlými statistikami, grafy a integrací na Google Sheets.',
    hint: 'Placeholder: banner #1',
    imageSrc: slide1,
  },
  {
    title: 'Transparentní datová vrstva',
    subtitle: 'Veškerá data tečou z veřejného Google Sheet — jednoduchá správa, rychlé iterace.',
    hint: 'Placeholder: banner #2',
    imageSrc: slide2,
  },
  {
    title: 'Grafy & trendy',
    subtitle: 'Připravujeme metriky výkonnosti, aktivitu hráčů a vývoj ratingu v čase.',
    hint: 'Placeholder: banner #3',
    imageSrc: slide3,
  },
];

export function BannerSlider({ slides }: Props) {
  const deck = useMemo(() => slides ?? DEFAULT_SLIDES, [slides]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % deck.length), 6000);
    return () => window.clearInterval(id);
  }, [deck.length]);

  const active = deck[index];

  return (
    <GlassPanel className="relative overflow-hidden" hover>
      {/* Background image (subtle, still calm). */}
      {active.imageSrc ? (
        <img
          src={active.imageSrc}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-55 dark:opacity-45"
          loading="lazy"
        />
      ) : null}

      {/* Contrast veil so text stays readable on every image. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgba(0,0,0,0.45)] via-[rgba(0,0,0,0.18)] to-transparent dark:from-[rgba(0,0,0,0.55)]" />

      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 animate-float rounded-full bg-[rgba(var(--accent),0.22)] blur-3xl" />
      <div className="pointer-events-none absolute -right-28 -bottom-24 h-80 w-80 animate-float rounded-full bg-[rgba(var(--accent-2),0.18)] blur-3xl" />

      <div className="relative flex flex-col gap-4 p-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-wider text-[rgb(var(--muted))]">{active.hint}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">{active.title}</h1>
          <p className="mt-3 text-base leading-relaxed text-[rgb(var(--muted))] md:text-lg">{active.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + deck.length) % deck.length)}
            className="glass-chip p-2 shadow-soft transition hover:translate-y-[-1px]"
            aria-label="Předchozí slide"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % deck.length)}
            className="glass-chip p-2 shadow-soft transition hover:translate-y-[-1px]"
            aria-label="Další slide"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="relative flex items-center gap-2 px-8 pb-6">
        {deck.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className={classNames(
              'h-2 w-2 rounded-full transition',
              i === index ? 'bg-[rgb(var(--text))]' : 'bg-[rgba(var(--muted),0.4)] hover:bg-[rgba(var(--muted),0.7)]',
            )}
            aria-label={`Jít na slide ${i + 1}`}
          />
        ))}
      </div>
    </GlassPanel>
  );
}
