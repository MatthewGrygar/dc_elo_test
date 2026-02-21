import hero from '../../assets/hero.svg?url';

export function BannerSlider() {
  return (
    <section className="banner panel" aria-label="Titulní banner">
      <div className="banner__bg" style={{ backgroundImage: `url(${hero})` }} />
      <div className="banner__overlay" />

      <div className="banner__content">
        <h1 className="banner__title">Duel Commander ELO</h1>
        <p className="banner__subtitle">Profesionální analytický přehled ELO a turnajových ratingů.</p>
      </div>
    </section>
  );
}
