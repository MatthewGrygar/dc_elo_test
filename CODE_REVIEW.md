# Code review notes (rewrite)

Cíl: **čistější struktura + stabilní deploy na GitHub Pages**.

## CI / build

- `npm run build` spouští `eslint`, `tsc --noEmit`, a pak `vite build`.
- Když CI spadne, vždy řeš první chybu v logu (další jsou často kaskáda).

## Routing / GitHub Pages

- Router je v `src/app/router.tsx` (Data Router / `createBrowserRouter`).
- `basename` se počítá v `src/app/basename.ts` (pro `*.github.io/<repo>/`).
- `public/404.html` posílá redirect přes query parametr `redirect=...`.
- `RedirectRestorer` v routeru tenhle redirect bezpečně obnoví.

## Struktura

- `src/app/*` – app-level wiring (router, providers, theme)
- `src/features/*` – logika a hooky
- `src/entities/*` – doménové komponenty
- `src/widgets/*` – layout a větší bloky UI
- `src/shared/*` – sdílené UI + utility

## UI konvence

- Preferuj malé komponenty + `useMemo` jen tam, kde je to potřeba.
- Theme je centralizované v `src/app/theme.tsx`.
- Na data ze Sheets se sahá přes `@tanstack/react-query`.

