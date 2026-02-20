import { useEffect, useMemo, useState } from "react";

type Slide = {
  title: string;
  subtitle: string;
  badge: string;
};

const SLIDES: Slide[] = [
  { title: "Transparentní ELO žebříček", subtitle: "Měř výkon, ne hype.", badge: "ELO" },
  { title: "Data-driven statistiky", subtitle: "Trendy, winrate, peak.", badge: "STATS" },
  { title: "Připraveno na růst", subtitle: "API / Sheets dnes, backend zítra.", badge: "2.0" },
];

export function Hero() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 4500);
    return () => window.clearInterval(t);
  }, []);

  const slide = SLIDES[idx];

  const dots = useMemo(
    () =>
      SLIDES.map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => setIdx(i)}
          className={[
            "h-2.5 w-2.5 rounded-full transition",
            i === idx ? "bg-[var(--brand)]" : "bg-[var(--border)] hover:bg-[var(--surface2)]",
          ].join(" ")}
          aria-label={`Přejít na slide ${i + 1}`}
        />
      )),
    [idx],
  );

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)] shadow-soft">
      <div className="relative p-6 md:p-10" style={{ background: "var(--hero-grad)" }}>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
              <span className="inline-block h-2 w-2 rounded-full bg-[var(--brand2)]" />
              {slide.badge}
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
              {slide.title}
            </h1>
            <p className="mt-3 text-base text-[var(--muted)] md:text-lg">{slide.subtitle}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#players"
                className="inline-flex items-center justify-center rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white shadow-soft transition hover:translate-y-[-1px] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              >
                Zobrazit hráče
              </a>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text)] shadow-soft transition hover:translate-y-[-1px] hover:bg-[var(--surface2)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              >
                Placeholder CTA
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-end">{dots}</div>
        </div>

        {/* Decorative card */}
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          <MiniCard label="Sezóna" value="S1 (placeholder)" />
          <MiniCard label="Aktualizace" value="Google Sheets" />
          <MiniCard label="Stav" value="Test build" />
        </div>
      </div>
    </div>
  );
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="text-xs font-semibold text-[var(--muted)]">{label}</div>
      <div className="mt-1 text-sm font-bold">{value}</div>
    </div>
  );
}
