# DC ELO 2.0 — v2.3.0

Modern, monochrome + data-accent analytics dashboard for Duel Commander ELO.

- **Tech:** TypeScript + React (Vite)
- **Hosting:** GitHub Pages (via GitHub Actions)
- **Data layer:** Public Google Sheet (Visualization API / gviz)

## Quick start

```bash
npm i
npm run dev
```

Build locally:

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

This repo is configured for **GitHub Pages via Actions**.

1. Push to `main`
2. In GitHub → **Settings → Pages**
   - Source: **GitHub Actions**
3. The workflow will build and deploy automatically.

> Note: Vite needs a non-root base path on GitHub Pages. The workflow sets `BASE_PATH="/<repo-name>/"` automatically.

CI installs dependencies with `npm ci` (using `package-lock.json`) for reproducible builds.

## Data source (Google Sheets)

Currently reading:
- Spreadsheet: `1y98bzsIRpVv0_cGNfbITapucO5A6izeEz5lTM92ZbIA`
- Sheet tab: **Elo standings**
- Columns:
  - A: Name
  - B: Rating
  - C: Games
  - D: Win
  - E: Loss
  - F: Draw
  - G: Winrate
  - H: Peak

Implementation lives here:
- `src/lib/googleSheet.ts`

### Troubleshooting

If data does not load on Pages:
- Make sure the sheet is public or "anyone with the link can view"
- Confirm the tab name is exactly `Elo standings`

## Architecture

High-level layout:

```
<AppShell>
 ├── <Header />
 ├── <BannerSlider />
 ├── <DashboardSection>
 │     ├── <SummaryPanels />
 │     ├── <ChartsGrid />
 ├── <LeaderboardSection>
 │     └── <Leaderboard />
 ├── <PlayerModal />
</AppShell>
```

- **Theme:** `src/lib/theme.tsx` (CSS variables + localStorage)
- **Styles:** `src/styles/global.css` (design tokens + components)
- **Domain types:** `src/types/*`

## Next steps (planned)

- Real chart datasets (rating history)
- Player detail modal: match history, commander stats
- Extra sections: Metagame, Commander stats, Match history

