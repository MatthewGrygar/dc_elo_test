# DC ELO – modern UI rewrite (React + Vite + Tailwind)

Tahle verze je kompletní přepis původního statického webu do moderního SPA:

- **React + TypeScript** (Vite)
- **TailwindCSS** (rychlé a čisté stylování)
- **Framer Motion** (jemné animace)
- **React Query** (cache + fetch CSV)
- **Recharts** (graf vývoje ELO)

Data se dál berou z původního Google Sheet (CSV export přes `gviz`).

## Lokální spuštění

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy na GitHub Pages

- Vite config má `base: './'`, takže build funguje jak na **project pages** (`/repo/`), tak na vlastním doménovém rootu.
- `public/404.html` zajišťuje správné přesměrování při refreshi na sub-route.

Postup (jedna z možností):

1. `npm run build`
2. Nasadit obsah složky `dist/` na GitHub Pages.

## Struktura

- `src/pages/HomePage.tsx` – leaderboard + search + DCPR toggle
- `src/components/modals/PlayerProfileModalContent.tsx` – profil hráče (graf + zápasy)
- `src/features/elo/*` – fetch + parsování CSV z Google Sheets
- `public/assets/*` – převzaté obrázky z původního repa

---

Pokud chceš doplnit sekce **Vedení** a **Články** reálným obsahem, stačí mi poslat texty/odkazy (nebo je přidáme do dalšího Google Sheetu).
