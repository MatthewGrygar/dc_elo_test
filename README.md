# DC ELO 2.0 (v2.3)

Moderní analytický dashboard pro Duel Commander ELO — **TypeScript + React + Vite**.

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

## Nasazení na GitHub Pages
Repo je připravené pro GitHub Pages přes **GitHub Actions** (`.github/workflows/deploy.yml`).

1. Pushni na větev `main`
2. V GitHubu otevři **Settings → Pages**
3. Source nastav na **GitHub Actions**
4. Po dalším pushi se stránka automaticky deployne

> Poznámka: Vite `base` se automaticky nastavuje na `/<repo-name>/` v CI přes proměnnou `BASE_PATH`.

## Data vrstva (Google Sheets)
Aktuálně se načítá list **"Elo standings"** z Google Sheet a bere se rozsah:
- A: Jméno
- B: Rating
- C: Games
- D: Win
- E: Loss
- F: Draw
- G: Winrate
- H: Peak

Konfigurace je v `src/data/googleSheet.ts`.

### Když by sheet nebyl veřejný
UI se automaticky přepne na lokální fallback data (`src/data/fallbackPlayers.ts`), aby stránka byla vždy funkční.

## Architektura komponent
```
<AppShell>
 ├── <Header />
 ├── <BannerSlider />
 ├── <DashboardSection>
 │    ├── <SummaryPanels />
 │    ├── <ChartsGrid />
 ├── <LeaderboardSection>
 │    └── <Leaderboard />
 └── <PlayerModal />
```

## Kód jako dokumentace
- většina komponent má krátké komentáře „proč“ (nejen „co“)
- utility jsou oddělené (`src/lib`, `src/data`, `src/types`)
- design tokeny jsou v CSS proměnných (`src/styles/tokens.css`)
