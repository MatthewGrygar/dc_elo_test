import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * GitHub Pages notes:
 * - Set BASE to '/<repo>/' (trailing slash!) for correct asset paths.
 * - You can do it via env: VITE_BASE=/<repo>/
 */
const base = process.env.VITE_BASE ?? '/';

export default defineConfig({
  base,
  plugins: [react()],
});
