import { ThemeToggle } from "./ThemeToggle";
import type { ThemeMode } from "../../hooks/useTheme";
import styles from "./header.module.css";

type Props = {
  theme: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
};

/**
 * Top navigation. Keep it clean + "SaaS / esport" premium.
 * We intentionally avoid routing for now; links are placeholders.
 */
export function Header({ theme, onThemeChange }: Props) {
  return (
    <header className={`${styles.topbar} panel panel--soft`}>
      <div className={styles.left}>
        <div className={styles.logo}>
          <span className={styles.logoMark} aria-hidden />
          <span>DC ELO</span>
        </div>

        <nav className={styles.nav}>
          <a href="#dashboard">Dashboard</a>
          <a href="#leaderboard">Leaderboard</a>
          <a href="#stats">Statistics</a>
        </nav>
      </div>

      <div className={styles.right}>
        <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
      </div>
    </header>
  );
}
