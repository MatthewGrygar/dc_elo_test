import { useEffect, useMemo, useState } from "react";
import styles from "./banner.module.css";

/**
 * BannerSlider is intentionally simple (no external carousel lib).
 * When we later add CMS or images, keep the slide model stable.
 */
type Slide = {
  id: string;
  title: string;
  subtitle: string;
  accent: "primary" | "secondary" | "highlight";
};

const ACCENTS = {
  primary: "var(--data-primary)",
  secondary: "var(--data-secondary)",
  highlight: "var(--data-highlight)",
} as const;

export function BannerSlider() {
  const slides = useMemo<Slide[]>(
    () => [
      {
        id: "hero",
        title: "Duel Commander ELO",
        subtitle: "Profesionální analytický přehled hráčů a výkonu.",
        accent: "primary",
      },
      {
        id: "meta",
        title: "Moderní dashboard",
        subtitle: "Glass panely • Jemné animace • Čitelná data.",
        accent: "secondary",
      },
      {
        id: "future",
        title: "Připravené na růst",
        subtitle: "Metagame • Commander stats • Match history (coming).",
        accent: "highlight",
      },
    ],
    [],
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setIndex((v) => (v + 1) % slides.length), 5200);
    return () => window.clearInterval(t);
  }, [slides.length]);

  const current = slides[index];

  return (
    <section className={styles.banner}>
      <div className={`container ${styles.inner}`}>
        <div className={`${styles.slide} panel`}>
          <div className={styles.bg} aria-hidden />
          <div
            className={styles.accent}
            style={{ background: ACCENTS[current.accent] }}
            aria-hidden
          />
          <div className={styles.content}>
            <div className={styles.kicker}>NEW DC ELO 2.0 • v2.3</div>
            <h1 className={styles.title}>{current.title}</h1>
            <p className={styles.subtitle}>{current.subtitle}</p>

            <div className={styles.statsRow}>
              <div className={`${styles.stat} panel panel--soft`}>
                <div className={styles.statLabel}>Season</div>
                <div className={styles.statValue}>2026</div>
              </div>
              <div className={`${styles.stat} panel panel--soft`}>
                <div className={styles.statLabel}>Players</div>
                <div className={styles.statValue}>—</div>
              </div>
              <div className={`${styles.stat} panel panel--soft`}>
                <div className={styles.statLabel}>Matches</div>
                <div className={styles.statValue}>—</div>
              </div>
            </div>

            <div className={styles.dots} aria-label="Slider">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
                  onClick={() => setIndex(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
