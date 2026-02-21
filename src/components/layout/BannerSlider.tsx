import React, { useEffect, useState } from 'react';
import { Panel } from '../common/Panel';

// Minimal slider: rotates between gradients (no external images needed).
const SLIDES = [
  {
    title: 'Duel Commander ELO',
    subtitle: 'Profesionální analytický přehled pro komunitu DC.'
  },
  {
    title: 'Premium UI',
    subtitle: 'Monochromatický design + decentní akcenty pro data.'
  }
] as const;

export function BannerSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 6500);
    return () => window.clearInterval(id);
  }, []);

  const slide = SLIDES[index];

  return (
    <section className="banner" aria-label="Titulní banner">
      <div className="banner__bg" aria-hidden="true" />

      <Panel variant="soft" className="banner__overlay">
        <div className="banner__kicker">DC ELO Dashboard 2.0</div>
        <h1 className="banner__title">{slide.title}</h1>
        <p className="banner__subtitle">{slide.subtitle}</p>

        <div className="banner__dots" aria-hidden="true">
          {SLIDES.map((_, i) => (
            <span key={i} className={i === index ? 'dot is-active' : 'dot'} />
          ))}
        </div>
      </Panel>
    </section>
  );
}
