# Petr Personal Page (Recruiter-friendly)

Minimal repo inspired by editorial CV motion graphics: paper background, ink typography, hairlines, calm reveal animations.

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Customize
- Replace **/public/profile.jpg** with your portrait (recommended: square-ish, >= 1200px).
- Put your CV into **/public/resume.pdf** and enable the “Download CV” button (remove `aria-disabled="true"` in `index.html`).
- Edit content directly in `index.html`.
- Styling is in `src/styles.css`.
- Animations/behavior in `src/main.ts`.

## Deploy
Any static hosting works:
- Vercel / Netlify / GitHub Pages (build output is `dist/`).
