import { useTheme } from "./ThemeProvider";

type Theme = "light" | "dark";

/**
 * Theme toggle (performance-first)
 * - Animates only transform + opacity (GPU-friendly)
 * - Keeps label width fixed to avoid layout jumps
 * - Both icons remain in DOM and crossfade
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label = theme === "light" ? "Světlý" : "Tmavý";

  return (
    <button className="themeToggle" onClick={toggleTheme} type="button" aria-label="Přepnout režim">
      <span className="themeToggleLabel">{label}</span>
      <span className="themeToggleTrack" aria-hidden="true">
        <span className="themeToggleThumb">
          <span className="iconSun" aria-hidden>
            ☀️
          </span>
          <span className="iconMoon" aria-hidden>
            🌙
          </span>
        </span>
      </span>
    </button>
  );
}
