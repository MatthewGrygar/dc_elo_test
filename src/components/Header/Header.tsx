import { DataSourceToggle } from './DataSourceToggle';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="header panel panel--soft">
      <div className="header__left">
        <div className="brand">
          <div className="brand__mark" aria-hidden="true">
            DC
          </div>
          <div className="brand__text">
            <div className="brand__title">DC ELO</div>
            <div className="brand__subtitle">Dashboard 2.0</div>
          </div>
        </div>

        <nav className="nav" aria-label="Navigace">
          <a className="nav__link" href="#dashboard">
            Dashboard
          </a>
          <a className="nav__link" href="#leaderboard">
            Leaderboard
          </a>
          <a className="nav__link" href="#statistics">
            Statistics
          </a>
        </nav>
      </div>

      <div className="header__right">
        <ThemeToggle />
        <DataSourceToggle />
      </div>
    </header>
  );
}
