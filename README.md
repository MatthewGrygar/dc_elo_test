# DC ELO 2.0 (skeleton)

React + TypeScript + Vite + Tailwind. Ready for **GitHub Pages** deployment.

## Co je v repozitáři

- **Titulní stránka**
  - banner se sliderem (placeholder)
  - top statistiky (počítané z tabulky)
  - grafy: 1× přes celou šířku + 4× menší (2 vedle sebe)
  - seznam hráčů (načítaný z Google Sheets)
- **Tmavý / světlý režim** (tlačítko nahoře, uloženo v `localStorage`)
- **Datová vrstva v0**: veřejný Google Sheet přes `/gviz/tq` (bez API key)

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

## Deploy na GitHub Pages

V repozitáři je workflow: `.github/workflows/deploy.yml`.

Postup na GitHubu:

1. **Repo → Settings → Pages**
2. Source: **GitHub Actions**
3. Push do `main` → workflow udělá build a deploy.

> Poznámka k `base` URL:
> - GitHub Pages běží typicky na `https://<user>.github.io/<repo>/`.
> - Workflow nastaví `VITE_BASE` automaticky na `/<repo>/`.

## Google Sheets (placeholder)

Zatím čteme list **"Elo standings"** a sloupce:

- A: Name
- B: Rating
- C: Games
- D: Win
- E: Loss
- F: Draw
- G: Winrate
- H: Peak

Implementace je v `src/data/googleSheets.ts`.

## Další kroky

- přidat stránku detailu hráče
- přidat match history + skutečné time-series grafy
- přidat caching (SWR / TanStack Query)
- přidat skeleton loading a error states (lepší UX)

---

Projekt je psaný tak, aby sloužil jako "malá dokumentace": stručné komentáře vysvětlují záměr a hranice současné verze.
