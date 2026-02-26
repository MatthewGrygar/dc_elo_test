import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#F5F1E8",
        ink: "#121212",
        ink2: "#3A3A3A",
        ink3: "#5B5B5B",
        accent: "#B89B73",
        border: "rgba(18,18,18,0.08)"
      },
      boxShadow: {
        soft: "0 20px 60px rgba(18,18,18,0.10)",
        lift: "0 24px 70px rgba(18,18,18,0.14)"
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem"
      },
      letterSpacing: {
        tightish: "-0.02em"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        signature: ["var(--font-signature)", "ui-serif"]
      }
    }
  },
  plugins: []
} satisfies Config;
