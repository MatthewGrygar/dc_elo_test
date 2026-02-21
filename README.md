# DC ELO — Modern Dashboard (Next.js + TS + Tailwind + shadcn-style UI)

Single-page dashboard (scroll sections) for DC ELO rating system with:
- Dark/Light theme (persist via `next-themes`)
- Segmented pill (ELO / DCPR) affecting labels and values across the page
- Auto-rotating hero slider (Framer Motion)
- KPI cards (glassmorphism)
- 1 full-width distribution chart + 4 charts (2×2) with per-card range dropdown
- Leaderboard table (sticky header, clickable rows)
- Player detail side panel (Sheet)

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Notes
- All data are mock placeholders in `/data`.
- Styling uses HSL tokens in `app/globals.css` for consistent theming across components and charts.
- UI components in `/components/ui` are minimal shadcn-like wrappers (Radix + Tailwind).
