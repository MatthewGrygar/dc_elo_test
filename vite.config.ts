import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Vite config
 *
 * Why `base: "./"`?
 * - GitHub Pages typically serves projects under a subpath:
 *   https://<user>.github.io/<repo>/
 * - If `base` stays as "/" then built assets will be referenced as `/assets/...`
 *   which becomes a 404 on GitHub Pages => white screen.
 * - Using a relative base makes the build portable across:
 *   - GitHub Pages subpaths
 *   - Static hosts that serve from a folder
 *   - Preview environments
 *
 * If you later deploy on a custom domain at the root and WANT absolute URLs,
 * you can change this to `base: "/"`.
 */
export default defineConfig({
  plugins: [react()],
  base: "./",
});
