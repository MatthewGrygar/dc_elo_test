import { useMemo } from 'react'

type BannerItem = {
  id: string
  imageUrl: string
  title: string
  subtitle: string
}

export function BannerSlider() {
  // Prepared for multi-banner slider later.
  const items = useMemo<BannerItem[]>(
    () => [
      {
        id: 'hero-1',
        imageUrl: `${import.meta.env.BASE_URL}banners/banner-1.svg`,
        title: 'Duel Commander ELO',
        subtitle: 'Profesionální analytický přehled ELO / DCPR výkonu hráčů'
      }
    ],
    []
  )

  const active = items[0]

  return (
    <section className="banner" aria-label="Titulní banner">
      <div className="bannerMedia" style={{ backgroundImage: `url(${active.imageUrl})` }} />
      <div className="bannerOverlay" />

      <div className="container bannerInner">
        <div className="bannerCard panel panel--hero">
          <div className="eyebrow">DC ELO Dashboard 2.0</div>
          <h1 className="bannerTitle">{active.title}</h1>
          <p className="bannerSubtitle">{active.subtitle}</p>

          <div className="bannerMeta">
            <div className="metaPill">Monochrome UI</div>
            <div className="metaPill">Glass panels</div>
            <div className="metaPill">Responsive</div>
          </div>
        </div>
      </div>
    </section>
  )
}
