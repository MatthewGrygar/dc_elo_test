# dc_elo (modern)

Moderní web pro ELO/DCPR: **React + TypeScript + Vite + Tailwind + Framer Motion + React Query**.

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

## GitHub Pages
Repo obsahuje workflow **.github/workflows/deploy.yml**, který po pushi do `main`:
1) udělá `npm ci`
2) `npm run build`
3) nasadí složku `dist` na GitHub Pages

V nastavení repozitáře nastav:
- **Settings → Pages → Build and deployment → Source: GitHub Actions**

### Routing na GitHub Pages
Používáme **BrowserRouter** s automatickým `basename` pro `*.github.io/<repo>/` a fallback přes `public/404.html`.
To znamená, že i přímé otevření `/player/:slug` na GitHub Pages neskončí 404.

## Struktura (po přepisu)
- `src/app/*` – router, providers, theme
- `src/features/*` – funkční moduly (elo, i18n, modal)
- `src/entities/*` – doménové UI (profil hráče)
- `src/widgets/*` – větší UI celky (shell, news)
- `src/shared/*` – znovupoužitelné UI + utility

