import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * GitHub Pages: Vite needs an explicit "base" when served from /<repo>/.
 *
 * Default behavior:
 * - If VITE_BASE is provided (e.g. in GH Actions), use that.
 * - Otherwise derive from package.json "name" (npm_package_name) -> /<name>/
 * - For local dev, Vite ignores base.
 */
/**
 * IMPORTANT (GitHub Pages):
 * The app is served from https://<user>.github.io/<repo>/, so Vite must build with
 * base = "/<repo>/".
 *
 * We prefer an explicit env var (VITE_BASE). If not provided, we derive it from
 * GITHUB_REPOSITORY ("owner/repo") which is available in GitHub Actions.
 */
const repoNameFromEnv = (() => {
  const repo = process.env.GITHUB_REPOSITORY // e.g. "user/dc_elo_test"
  if (!repo) return ''
  const parts = repo.split('/')
  return parts.length === 2 ? parts[1] : ''
})()

const base = process.env.VITE_BASE
  ? process.env.VITE_BASE
  : process.env.GITHUB_PAGES === 'true'
    ? `/${repoNameFromEnv}/`
    : '/'

export default defineConfig({
  plugins: [react()],
  base
})
