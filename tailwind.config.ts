import type { Config } from "tailwindcss";

/**
 * Tailwind config
 * - We use class-based dark mode: the <html> element toggles "dark".
 * - Design tokens are expressed as CSS variables (see src/styles/theme.css).
 */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 10px 30px -12px rgb(0 0 0 / 0.35)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
