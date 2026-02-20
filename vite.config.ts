import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * GitHub Pages base path
 *
 * - Local dev: "/"
 * - GitHub Actions: set BASE_PATH="/<repo-name>/"
 *
 * Why: GitHub Pages typically serves static assets under "/<repo-name>/".
 * We keep this configurable to avoid hardcoding the repository name.
 */
const base = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base,
  plugins: [react()],
});
