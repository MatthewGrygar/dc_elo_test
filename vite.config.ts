import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * GitHub Pages needs a non-root base path, typically `/<repo>/`.
 * The workflow sets BASE_PATH automatically, so local dev stays on `/`.
 */
export default defineConfig(() => {
  const base = process.env.BASE_PATH ?? '/';
  return {
    base,
    plugins: [react()],
    server: { port: 5173 },
  };
});
