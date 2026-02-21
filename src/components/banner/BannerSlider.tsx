export function BannerSlider() {
  return (
    <section className="banner" aria-label="Hero">
      <div className="banner__media" />
      <div className="banner__overlay" />

      <div className="banner__content panel panel--hero">
        <h1 className="banner__title">Duel Commander ELO</h1>
        <p className="banner__subtitle">Profesionální analytický přehled ratingů, výsledků a trendů.</p>

        <div className="banner__chips" aria-label="Highlights">
          <span className="chip">Data-first UI</span>
          <span className="chip">Google Sheets</span>
          <span className="chip">ELO / DCPR</span>
        </div>
      </div>
    </section>
  );
}
