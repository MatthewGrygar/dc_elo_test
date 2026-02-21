# DC ELO Dashboard 2.0 (React + TypeScript + Vite)

Moderní, responzivní analytický dashboard pro Duel Commander ELO, připravený pro GitHub Pages.

## Lokální spuštění

```bash
npm install
npm run dev
```

## Produkční build

```bash
npm run build
npm run preview
```

## GitHub Pages deploy (doporučeno: GitHub Actions)

Workflow `.github/workflows/deploy.yml` nasazuje na GitHub Pages při každém push do `main`.
V repo nastavení nastav: **Settings → Pages → Source: GitHub Actions**.

## Google Sheets (CSV)

Aplikace načítá leaderboard z publikovaného CSV.
Nastav URL ve `.env` (necommitovat):

```bash
VITE_SHEETS_ELO_CSV_URL="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
VITE_SHEETS_DCPR_CSV_URL="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
```

Pokud `.env` nenastavíš, použije se demo dataset.
