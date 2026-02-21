import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      container: {
        center: true,
        padding: "1.25rem",
        screens: { "2xl": "1280px" }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      backdropBlur: {
        xs: "2px"
      },
      backgroundImage: {
        "dash-dark":
          "radial-gradient(circle at 20% 15%, rgba(59,130,246,0.18), transparent 45%), radial-gradient(circle at 75% 0%, rgba(14,165,233,0.12), transparent 40%), radial-gradient(circle at 85% 70%, rgba(99,102,241,0.10), transparent 45%)",
        "dash-light":
          "radial-gradient(circle at 15% 10%, rgba(245,158,11,0.08), transparent 40%), radial-gradient(circle at 80% 0%, rgba(59,130,246,0.08), transparent 40%)"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.12)",
        glass: "0 8px 24px rgba(0,0,0,0.22)"
      },
      keyframes: {
        shimmer: {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "-200% 0" }
        }
      },
      animation: {
        shimmer: "shimmer 1.4s linear infinite"
      }
    }
  },
  plugins: []
}

export default config
