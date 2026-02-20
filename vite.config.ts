import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

/**
 * GitHub Pages note:
 * - When deployed under https://<user>.github.io/<repo>/ you must set Vite's `base` to `/<repo>/`.
 * - This config reads BASE_PATH from env (set in GitHub Actions). Locally it's '/'.
 */
export default defineConfig(({ mode }) => {
  const base = process.env.BASE_PATH ?? '/';
  return {
    base,
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    build: {
      sourcemap: mode !== 'production',
    },
  };
});
