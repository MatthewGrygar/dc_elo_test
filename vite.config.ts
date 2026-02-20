import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * GitHub Pages needs the correct base path (/<repo>/).
 * The workflow injects REPO_NAME at build-time.
 */
const repoName = process.env.REPO_NAME;
const base =
  process.env.NODE_ENV === "production" && repoName ? `/${repoName}/` : "/";

export default defineConfig({
  plugins: [react()],
  base,
});
