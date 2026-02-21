# DC ELO – Dashboard (Next.js + TypeScript + shadcn/ui)

Moderní single‑page dashboard pro DC ELO (ELO/DCPR přepínač), s mock daty, grafy (Recharts), animacemi (Framer Motion), ikonami (lucide-react) a plnohodnotným dark/light theme (next-themes).

## Lokální spuštění

```bash
npm install
npm run dev
```

## GitHub Pages deploy (statický export)

Tento projekt je připravený pro GitHub Pages pomocí **GitHub Actions**.

### 1) Zapni GitHub Pages přes Actions

V repozitáři:
- **Settings → Pages → Build and deployment**
- zvol **Source: GitHub Actions**

### 2) Nastav basePath (důležité)

GitHub Pages hostuje projekt pod cestou `/<repo>` (např. `https://user.github.io/dc_elo_test/`).

Proto je potřeba nastavit `NEXT_PUBLIC_BASE_PATH` na název repozitáře s lomítkem:
- repo `dc_elo_test` → `NEXT_PUBLIC_BASE_PATH=/dc_elo_test`

V tomto repu je to nastavené ve workflow souboru:

- `.github/workflows/deploy-pages.yml`

> Pokud se jmenuje repo jinak, uprav v workflow hodnotu `NEXT_PUBLIC_BASE_PATH`.

### 3) Push do `main`

Po každém `git push` do `main` se spustí build a deploy na GitHub Pages.

## Poznámky

- `next.config.mjs` je nastavený na `output: "export"`, aby vznikl statický web do složky `out/`.
- `images.unoptimized: true` je nutné pro export na GitHub Pages.
