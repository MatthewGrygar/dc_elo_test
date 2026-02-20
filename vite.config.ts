import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

/**
 * GitHub Pages note:
 * - When deploying to https://<user>.github.io/<repo>/ the app must be built with base="/<repo>/".
 * - The provided GitHub Action sets VITE_BASE to that value automatically.
 * - Locally, base defaults to '/'.
 */
export default defineConfig(() => {
  const base = process.env.VITE_BASE ?? '/';
  return {
    base,
    plugins: [react()],
  };
});
