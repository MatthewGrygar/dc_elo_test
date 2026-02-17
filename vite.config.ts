import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base makes GitHub Pages project sites + custom domains easy.
export default defineConfig({
  base: './',
  plugins: [react()],
})
