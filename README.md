# DC ELO 2.0 — v2.3 (TypeScript + React)

Moderní, modulární analytický dashboard pro **Duel Commander ELO**.  
Cíl této verze: **čistý skeleton + placeholdery**, připravené na rychlé rozšiřování.

## Tech stack
- React 18 + TypeScript
- Vite (rychlý dev server, jednoduchý deploy)
- Recharts (grafy)
- GitHub Pages deploy přes GitHub Actions (bez ručního klikání)

## Lokální spuštění
```bash
npm install
npm run dev
```

## Build / Preview
```bash
npm run build
npm run preview
```

## Deploy na GitHub Pages (CI)
Repo je připravené na Pages deploy přes workflow:

- push na `main` spustí build
- artifact se nasadí na GitHub Pages (branchless Pages via Actions)

### 1) Zapni GitHub Pages
Repo → **Settings → Pages** → Source: **GitHub Actions**.

### 2) Ujisti se, že workflow běží
Workflow je v `.github/workflows/deploy.yml`.

> Pozn.: Vite potřebuje base path `/<repo>/`. Workflow posílá do build procesu `REPO_NAME`.

## Data: Google Sheet
Data se berou ze sheetu (placeholder integrace už je hotová):

- dokument: `1y98bzsIRpVv0_cGNfbITapucO5A6izeEz5lTM92ZbIA`
- list: **Elo standings**
- sloupce:
  - A Name
  - B Rating
  - C Games
  - D Win
  - E Loss
  - F Draw
  - G Winrate
  - H Peak

Aplikace tahá CSV export přes Google "gviz" endpoint.

### Když data nepůjdou načíst
Nejčastější důvody:
- Sheet není veřejný (`Anyone with the link can view`)
- List se jmenuje jinak (musí být přesně `Elo standings`)

## Struktura aplikace
```
src/
  app/               # layout + sekce
  components/        # UI komponenty (banner, charts, leaderboard, modal)
  data/              # google sheets fetch + csv parser
  hooks/             # usePlayers()
  styles/            # design tokens + globální styl
  types/             # TS typy
```

## Kodovací standard (pro budoucí AI)
- Komponenty jsou malé, pojmenované a mají krátké docstringy.
- UI je postavené z "panel" primitiva s tokeny (light/dark).
- Data layer je izolovaná (`src/data/`), aby se později snadno vyměnila za API.

---

Plán další iterace:
- PlayerModal: detailní statistiky, match history
- reálné grafy z dat (zatím demo data)
- routing (Dashboard / Leaderboard / Statistics)
