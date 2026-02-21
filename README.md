# DC ELO Dashboard 2.0

Moderní, responzivní analytický dashboard pro Duel Commander ELO systém.

- **Stack:** React + TypeScript + Vite
- **Design:** monochromatické UI + jemné akcenty pro data (glassmorphism)
- **Data:** Google Sheets (publikované jako CSV)
- **Deploy:** GitHub Pages (gh-pages)

## Rychlý start

```bash
npm install
npm run dev
```

Aplikace poběží lokálně na výchozím Vite portu.

## Konfigurace dat (Google Sheets → CSV)

1. Otevři Google Sheet.
2. **File → Share → Publish to web**.
3. Vyber list (např. *Elo standings*) a formát **CSV**.
4. Zkopíruj URL a vlož ji do `.env`.

Vzorový soubor proměnných je v `.env.example`.

```bash
cp .env.example .env
# vyplň:
# VITE_SHEETS_ELO_STANDINGS_CSV=...
# VITE_SHEETS_TOURNAMENT_ELO_CSV=...
```

Pokud URL není nastavena, aplikace automaticky použije **mock data** (aby UI šlo ladit i bez sheetu).

## Přepínače

- **Světlý/Tmavý režim**: ukládá se do `localStorage` (`dc-elo.theme`) a zároveň nastavuje `html[data-theme]`.
- **Zdroj dat (ELO/DCPR)**: přepíná, z jakého CSV se načítají data.

## Struktura projektu

```
src/
  assets/           # obrázky / svg
  components/
    AppShell/       # hlavní layout + modal mount
    Header/         # logo, navigace, toggly
    BannerSlider/   # hero banner (zatím 1 slide placeholder)
    Dashboard/      # KPI + grafy (placeholder)
    Leaderboard/    # tabulka hráčů (scroll)
    PlayerModal/    # detail hráče
    common/         # sdílené drobné komponenty
  context/          # Theme + DataSource + DataProvider
  hooks/            # useTheme, useDataSource, useStandings
  services/         # fetch + CSV parser
  styles/           # design tokens a globální styly
  types/            # TS typy
  utils/            # formátování
```

## GitHub Pages deploy

### 1) Nastav base path

GitHub Pages hostuje aplikaci pod `https://<uzivatel>.github.io/<repo>/`, takže Vite potřebuje znát base path pro assety.

- do `.env` nastav:

```bash
VITE_BASE="/<repo>/"
```

### 2) Deploy přes gh-pages

```bash
npm run build
npm run deploy
```

Skript `deploy` nasazuje obsah složky `dist/` do branche `gh-pages`.

> Pozn.: Pole `homepage` v `package.json` je ponecháno pro orientaci (CRA styl), ale u Vite rozhoduje `base`.

## Další rozšíření (plán)

- napojení grafů na historii zápasů / ELO time-series
- další sekce: metagame, historie turnajů, detailní statistiky
- volitelná virtualizace leaderboardu (react-window) při velmi dlouhých seznamech

---

© DC ELO Dashboard 2.0
