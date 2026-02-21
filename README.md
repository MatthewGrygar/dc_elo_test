# DC ELO Dashboard 2.0 (React + TypeScript + Vite)

Moderní, responzivní analytický dashboard pro Duel Commander ELO systém.

## Lokální spuštění

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
npm run preview
```

## Připojení Google Sheets (CSV)

Dashboard očekává veřejně publikované CSV z Google Sheets.

1. V Google Sheets:
   - **File → Share → Publish to web**
   - vyber list (např. `Elo standings`) a formát **CSV**
   - zkopíruj URL

2. V projektu vytvoř `.env.local` podle `.env.example`:

```env
VITE_ELO_CSV_URL="https://docs.google.com/spreadsheets/d/e/<PUBLISHED_ID>/pub?gid=<GID>&single=true&output=csv"
VITE_DCPR_CSV_URL="https://docs.google.com/spreadsheets/d/e/<PUBLISHED_ID>/pub?gid=<GID>&single=true&output=csv"
```

3. Ujisti se, že první řádek v CSV obsahuje hlavičky sloupců.
   - Mapování hlaviček je v `src/services/standingsService.ts` (konstanta `COLUMN_KEYS`).

## GitHub Pages deploy (automaticky přes GitHub Actions)

V repozitáři je připraven workflow `.github/workflows/deploy.yml`.

### Jak to funguje
- Build proběhne na GitHubu po pushi na `main`.
- Vite `base` je nastaveno automaticky podle názvu repozitáře (např. `/dc-elo-dashboard-2.0/`).
- Artefakt `dist/` se nasadí do GitHub Pages.

### Nastavení v GitHubu
1. **Settings → Pages**
2. Source: **GitHub Actions**

> Pozn.: Workflow má správně nastavené `permissions` pro Pages.

## Struktura projektu

- `src/components/` – UI komponenty (layout, dashboard, leaderboard, modal)
- `src/context/` – globální preference (téma + zdroj dat)
- `src/hooks/` – datové hooky (načítání standings)
- `src/services/` – komunikace se Sheets (CSV fetch + parsing)
- `src/styles/` – design tokens + glass styling
- `src/types/` – TypeScript typy

## Poznámky k výkonu
- Leaderboard je **virtualizovaný** přes `react-window`.
- Řádky leaderboardu nepoužívají `backdrop-filter` (blur) – blur je jen na velkých panelech.

---

Když narazíš na problém s načítáním dat, první věc: otevři CSV URL v prohlížeči a ověř, že vrací čistý CSV text.
