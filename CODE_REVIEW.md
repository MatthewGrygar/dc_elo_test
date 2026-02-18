# Code review notes (Patch 5 stability)

This repository is intentionally kept **deployment-stable on GitHub Pages**.

## CI / build

- `npm run build` runs `eslint`, `tsc --noEmit`, then `vite build`.
- If CI starts failing, first check the build log for the **first** syntax / type error.

## Common pitfalls (fixed here)

- **JSX tag mismatch** (missing closing tags) can cascade into unrelated-looking errors.
- Avoid raw `<` inside JSX text; use `&lt;` or `{ '<' }`.
- Avoid `any` where possible; prefer:
  - `unknown` + narrowing
  - specific interfaces for sheet rows

## Structure

- Home page: `src/pages/HomePage.tsx`
- Player modal: `src/components/modals/PlayerProfileModalContent.tsx`
- Sheet fetching + mapping: `src/features/elo/sheets.ts`, `src/features/elo/hooks.ts`

## UI conventions

- Panels use consistent rounding + shadow so they stand out from the background.
- Light/Dark mode is toggled from the header and stored in `localStorage`.
