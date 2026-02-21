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
const base =
  process.env.VITE_BASE ??
  (process.env.GITHUB_PAGES === 'true'
    ? `/${process.env.npm_package_name ?? ''}/`
    : '/')

export default defineConfig({
  plugins: [react()],
  base
})
