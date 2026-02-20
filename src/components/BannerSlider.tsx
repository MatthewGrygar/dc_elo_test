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
      {/* Decorative blobs (subtle) */}
      <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 animate-float rounded-full bg-[rgba(var(--accent),0.14)] blur-3xl" />
      <div className="pointer-events-none absolute -right-28 -bottom-24 h-80 w-80 animate-float rounded-full bg-[rgba(var(--teal),0.10)] blur-3xl" />

      <div className="relative grid gap-6 p-7 md:grid-cols-[1.2fr,0.8fr] md:items-center md:gap-8 md:p-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-wider text-[rgb(var(--muted))]">{active.hint}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">{active.title}</h1>
          <p className="mt-3 text-base leading-relaxed text-[rgb(var(--muted))] md:text-lg">{active.subtitle}</p>

          <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + deck.length) % deck.length)}
            className="glass-chip ui-hover p-2"
            aria-label="Předchozí slide"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % deck.length)}
            className="glass-chip ui-hover p-2"
            aria-label="Další slide"
          >
            <ChevronRight size={18} />
          </button>
          </div>
        </div>

        {/* Right-side image — avoids awkward empty space and feels more "dashboard" than a full-bleed hero. */}
        {active.imageSrc ? (
          <div className="relative">
            <div className="pointer-events-none absolute -inset-6 rounded-[28px] bg-gradient-to-br from-[rgba(var(--accent),0.14)] via-transparent to-[rgba(var(--gold),0.10)] blur-2xl" />
            <div className="glass-panel p-3">
              <img
                src={active.imageSrc}
                alt=""
                className="h-44 w-full rounded-[22px] object-cover sm:h-52"
                loading="lazy"
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="relative flex items-center gap-2 px-7 pb-6 md:px-8">
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
