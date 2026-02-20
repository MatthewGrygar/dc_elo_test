# DC ELO 2.0 (v2.3)

TypeScript + React (Vite) skeleton pro **Duel Commander ELO** analytický dashboard.

## Co je už hotové

- ✅ Modulární layout: `Header → Banner → Dashboard → Leaderboard → PlayerModal`
- ✅ Přepínač tématu (Světlý/Tmavý) s animací (GPU friendly: transform + opacity)
- ✅ Přepínač zdroje dat `ELO / DCPR` (sheet: `Elo standings` / `Tournament_Elo`)
- ✅ Načítání dat z veřejného Google Sheet jako CSV (bez backendu)
- ✅ Leaderboard je virtualizovaný (`react-window`) → plynulejší scroll i pro stovky hráčů
- ✅ Glass UI styl (decentní) + sjednocené tokeny pro dark/light

## Lokální spuštění

```bash
npm install
npm run dev
```

## GitHub Pages deploy (automaticky)

Repo je připravený na build + deploy přes GitHub Actions.

1. Pushni projekt do GitHubu (branch **main**)
2. V GitHub → **Settings → Pages**:
   - Source: **GitHub Actions**
3. Po každém pushi na main se web automaticky buildí a publikuje.

> Pozn.: Workflow nastavuje `BASE_PATH=/<repo>/` automaticky.

## Data layer (Google Sheets)

Aktuálně se čte veřejný sheet:
- Spreadsheet ID: `1y98bzsIRpVv0_cGNfbITapucO5A6izeEz5lTM92ZbIA`
- ELO: sheet `Elo standings`
- DCPR: sheet `Tournament_Elo`

Mapování sloupců (A–H):
- A: Name
- B: Rating
- C: Games
- D: Win
- E: Loss
- F: Draw
- G: Winrate
- H: Peak

> Pokud se sheet stane privátní, bude potřeba backend nebo service account.

## Struktura

```
src/
  app/                # contexty, hooks
  components/         # UI primitives (Header, toggles)
  features/
    dashboard/        # hero, KPI, charts
    leaderboard/      # seznam hráčů
    player/           # modal detail
  lib/                # sheets client, stats
  styles/             # design tokens
  types/              # TS types
```

## Co budeme doplňovat dál

- skutečné KPI z match historie (active 7d/30d, delta elo, upset rate)
- reálné grafy (volume bar chart, trends)
- detail hráče (ELO vývoj, soupeři, metriky stability/momentum/clutch)
- cache + revalidation (SWR/React Query) podle potřeby

