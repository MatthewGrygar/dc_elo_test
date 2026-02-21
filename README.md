# DC ELO Dashboard 2.0 (React + TypeScript + Vite)

Moderní, responzivní analytický dashboard pro Duel Commander ELO/DCPR.

## Rychlý start

```bash
npm install
npm run dev
```

## Nastavení dat (Google Sheets CSV)

1. V Google Sheetu: **File → Share → Publish to web** (nebo „Publikovat na web“) a zvol **CSV**.
2. Zkopíruj URL (CSV endpoint) pro sheet s ELO standings.
3. Vytvoř soubor `.env` podle `.env.example` a doplň:

```bash
VITE_SHEETS_ELO_CSV_URL="https://docs.google.com/spreadsheets/d/<SHEET_ID>/pub?output=csv&gid=<GID>"
VITE_SHEETS_DCPR_CSV_URL="https://docs.google.com/spreadsheets/d/<SHEET_ID>/pub?output=csv&gid=<GID>"
```

> Pozn.: CSV varianta je vhodná pro veřejná data bez přihlašování.

## Deploy na GitHub Pages (doporučené: GitHub Actions)

Repozitář už obsahuje workflow: `.github/workflows/deploy.yml`.

### 1) Zapnutí GitHub Pages

- Repo → **Settings → Pages**
- **Build and deployment**: zvol **GitHub Actions**

### 2) Push do `main`

Jakmile pushneš do `main`, workflow:
- nainstaluje dependencies
- udělá `npm run build`
- nasadí složku `dist/` na GitHub Pages

### Poznámka k base path

GitHub Pages servíruje appku typicky z `/REPO_NAME/`.

V `vite.config.ts` je připravená logika:
- v Actions se nastavuje `GITHUB_PAGES=true`
- base se pak odvodí z názvu repozitáře (npm package name)

Pokud chceš base explicitně, odkomentuj v workflow proměnnou:

```yml
VITE_BASE: "/${{ github.event.repository.name }}/"
```

## Alternativa: deploy přes `gh-pages` (lokálně)

Pokud preferuješ starý styl deploye, je připravený skript:

```bash
npm run deploy
```

To vytvoří build a nahraje `dist/` na branch `gh-pages`.

---

## Struktura

- `src/app` – AppShell a bootstrap
- `src/components` – UI komponenty (Header, Banner, Dashboard, Leaderboard, Modal)
- `src/context` – Theme + DataSource + Modal kontext
- `src/services` – načítání dat z Google Sheets CSV
- `src/styles` – design tokens + glassmorphism styly

## Další rozšíření (připraveno)

- více sekcí (metagame, historie zápasů)
- detailní grafy v modalu
- další sheet pro DCPR / Tournament_Elo
- další routy / navigace

