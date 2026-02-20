import type { ThemeMode } from "../../hooks/useTheme";
import styles from "./header.module.css";

type Props = {
  theme: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
};

/**
 * Simple theme toggle. (No icon library yet; we keep it dependency-light.)
 */
export function ThemeToggle({ theme, onThemeChange }: Props) {
  const next: ThemeMode = theme === "dark" ? "light" : "dark";

  return (
    <button
      className={styles.themeButton}
      type="button"
      onClick={() => onThemeChange(next)}
      aria-label={`Přepnout na ${next === "dark" ? "tmavý" : "světlý"} režim`}
      title="Toggle theme"
    >
      <span className={styles.themeDot} aria-hidden />
      <span style={{ fontSize: 13, fontWeight: 600 }}>
        {theme === "dark" ? "Dark" : "Light"}
      </span>
      <span className="kbd" style={{ marginLeft: 10 }}>
        T
      </span>
    </button>
  );
}
