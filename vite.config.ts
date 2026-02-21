import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * GitHub Pages notes:
 * - When hosted at https://<user>.github.io/<repo>/, Vite needs base="/<repo>/".
 * - The included GitHub Actions workflow sets VITE_BASE to "/<repo>/" automatically.
 */
export default defineConfig(({ mode }) => {
  const base = process.env.VITE_BASE || '/';

  return {
    base,
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true
    },
    build: {
      outDir: 'dist'
    },
    define: {
      __APP_ENV__: JSON.stringify(mode)
    }
  };
});
