# Matthew Grygar — osobní stránka (GitHub Pages)

Minimalistická, elegantní osobní stránka inspirovaná dodaným stylem (béžové pozadí, výrazná serif typografie, čisté rozvržení) + jemné animace.

## Struktura
- `index.html` – obsah stránky
- `styles.css` – styling
- `main.js` – malé animace/reveal + smooth scroll
- `assets/` – fotka a drobná textura

## Jak spustit lokálně
Nejjednodušší je použít libovolný statický server:

```bash
# varianta 1 (Python)
python3 -m http.server 5173

# varianta 2 (Node)
npx serve .
```

Pak otevři `http://localhost:5173`.

## Nasazení na GitHub Pages
1. Vytvoř nový repo (např. `matthew-grygar`).
2. Nahraj obsah tohoto projektu do rootu repozitáře.
3. Na GitHubu: **Settings → Pages**
   - **Build and deployment**: *Deploy from a branch*
   - Branch: `main` (nebo `master`) / folder: `/ (root)`
4. Hotovo – GitHub Pages ti vygeneruje URL.

## Co upravit jako první
- Jméno a texty: `index.html` (sekce **O mně**, **Pozice**, **Projekty**, **Kontakt**)
- Kontakty: e‑mail, LinkedIn, GitHub odkazy
- Případně barvy: `styles.css` (CSS proměnné v `:root`)

---

Pozn.: Fotka je už připravená jako PNG s průhledným pozadím (`assets/matthew-hero.png`).
