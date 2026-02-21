import { ThemeToggle } from '../ui/ThemeToggle';
import { DataSourceToggle } from '../ui/DataSourceToggle';

export function Header() {
  return (
    <header className="header">
      <div className="container header__inner panel panel--soft">
        <div className="header__left">
          <div className="logo" aria-label="DC ELO">
            <span className="logo__mark">DC</span>
            <span className="logo__text">ELO</span>
          </div>

          <nav className="nav" aria-label="Navigation">
            <a className="nav__link" href="#dashboard">Dashboard</a>
            <a className="nav__link" href="#leaderboard">Leaderboard</a>
            <a className="nav__link" href="#statistics">Statistics</a>
          </nav>
        </div>

        <div className="header__right">
          <DataSourceToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
