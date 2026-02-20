import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Vite config
 * - React SWC plugin keeps dev fast.
 * - Base can be adjusted if you deploy under a subpath.
 */
export default defineConfig({
  plugins: [react()],
});
