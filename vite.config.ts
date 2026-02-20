import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * GitHub Pages needs a non-root base path: /<repo-name>/
 *
 * - In local dev we keep base = '/'
 * - In CI (GitHub Actions) we set BASE_PATH = "/${{ github.event.repository.name }}/"
 */
export default defineConfig(({ mode }) => {
  const base = process.env.BASE_PATH ?? '/';

  return {
    base,
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true
    },
    build: {
      sourcemap: mode !== 'production'
    }
  };
});
