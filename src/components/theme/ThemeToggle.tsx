import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button className="btn btn--ghost" onClick={toggleTheme} type="button" aria-label="Toggle theme">
      <span className="btnIcon" aria-hidden>
        {theme === "dark" ? "🌙" : "☀️"}
      </span>
      <span className="btnLabel">{theme === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}
