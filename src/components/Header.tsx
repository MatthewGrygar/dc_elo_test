import { ThemeToggle } from './ThemeToggle';
import { formatRelativeTime } from '../lib/time';

export function Header({
  onRefresh,
  refreshedAt
}: {
  onRefresh: () => void;
  refreshedAt: number | null;
}) {
  return (
    <header className="topbar panel panel--soft">
      <div className="topbarLeft">
        <div className="logo">
          <span className="logoMark" aria-hidden>
            DC
          </span>
          <span className="logoText">ELO</span>
        </div>

        <nav className="topnav" aria-label="Primary">
          <a href="#dashboard">Dashboard</a>
          <a href="#leaderboard">Leaderboard</a>
          <a href="#stats" className="isDisabled" aria-disabled>
            Statistics
          </a>
        </nav>
      </div>

      <div className="topbarRight">
        <button className="btn btn--ghost" onClick={onRefresh} type="button">
          Refresh
          <span className="btnMeta">{refreshedAt ? formatRelativeTime(refreshedAt) : '—'}</span>
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
