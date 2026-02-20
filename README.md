# NEW DC ELO 2.0

Frontend skeleton pro DC ELO (TypeScript + React).  
Cíl: čistý, čitelný kód, který funguje i jako „malá dokumentace“ pro budoucí údržbu / AI.

## Stack
- Vite + React + TypeScript
- TailwindCSS (dark mode přes `class` na `<html>`)
- Recharts (placeholder grafy)
- Data pro hráče: Google Sheets (sheet **Elo standings**, rozsah `A2:H`)

## Lokální spuštění
```bash
npm install
npm run dev
```

## Build / Preview
```bash
npm run build
npm run preview
```

## Deploy (rychlý test)
- Vercel / Netlify / GitHub Pages (Vite build do `dist/`)
- Pokud deployujete pod subpath, upravte `base` ve `vite.config.ts`.

## Konfigurace Google Sheets
Aktuálně se data čtou přes „GViz“ endpoint (bez API klíče).  
Pokud by někdy Google změnil formát nebo by nastala CORS/permission komplikace:
- nejjednodušší fix bývá **Publish to web** (CSV/JSON) nebo
- vlastní malý backend proxy.

Konstanty najdete v `src/lib/googleSheets.ts`.

## Struktura
- `src/app/App.tsx` – hlavní layout stránky
- `src/components/*` – UI bloky (slider, stats, charts, player table)
- `src/lib/*` – utilitky (Google Sheets fetch + parsování)
- `src/styles/*` – design tokeny (světlý/tmavý režim)

---

Plán další iterace:
1) Přidat reálné grafy (např. vývoj ELO, histogram ratingů, winrate distribution).  
2) Přidat filtrování/sortování hráčů.  
3) Přidat caching a refresh interval pro Sheets.
