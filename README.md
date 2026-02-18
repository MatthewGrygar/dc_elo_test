# dc_elo (modern)

Moderní přepis původního webu: **React + TypeScript + Vite + Tailwind + Framer Motion**.

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

## GitHub Pages (doporučeno)
Repo obsahuje workflow **.github/workflows/deploy.yml**, který po pushi do `main`:
1) udělá `npm ci`
2) `npm run build`
3) nasadí složku `dist` na GitHub Pages

V nastavení repozitáře nastav:
- **Settings → Pages → Build and deployment → Source: GitHub Actions**

## Routing
Používáme `HashRouter` (funguje spolehlivě na GitHub Pages bez server-side rewrites).


## Co je nové ve v2.1
- PWA (offline cache + install)
- Modernější landing + statistiky + rozložení ratingu
- Vylepšený profil hráče (zoom/brush + delta bar chart)
