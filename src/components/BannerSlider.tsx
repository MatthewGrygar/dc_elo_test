import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import classNames from 'classnames';

export type Slide = {
  title: string;
  subtitle: string;
  hint?: string;
};

type Props = {
  slides?: Slide[];
};

const DEFAULT_SLIDES: Slide[] = [
  {
    title: 'DC ELO 2.0',
    subtitle: 'Nová generace žebříčku s rychlými statistikami, grafy a integrací na Google Sheets.',
    hint: 'Placeholder: banner #1',
  },
  {
    title: 'Transparentní datová vrstva',
    subtitle: 'Veškerá data tečou z veřejného Google Sheet — jednoduchá správa, rychlé iterace.',
    hint: 'Placeholder: banner #2',
  },
  {
    title: 'Grafy & trendy',
    subtitle: 'Připravujeme metriky výkonnosti, aktivitu hráčů a vývoj ratingu v čase.',
    hint: 'Placeholder: banner #3',
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
    <section className="relative overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))]/60 shadow-soft backdrop-blur">
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
            className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))]/60 p-2 shadow-soft backdrop-blur transition hover:translate-y-[-1px]"
            aria-label="Předchozí slide"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % deck.length)}
            className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))]/60 p-2 shadow-soft backdrop-blur transition hover:translate-y-[-1px]"
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
    </section>
  );
}
