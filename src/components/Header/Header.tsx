import { ThemeToggle } from './ThemeToggle'
import { DataSourceToggle } from './DataSourceToggle'

export function Header() {
  return (
    <header className="header">
      <div className="container headerInner panel panel--soft">
        <div className="brand">
          <div className="brandMark">DC</div>
          <div className="brandText">
            <div className="brandTitle">DC ELO</div>
            <div className="brandSub">Dashboard 2.0</div>
          </div>
        </div>

        <nav className="nav">
          <a className="navLink" href="#dashboard">
            Dashboard
          </a>
          <a className="navLink" href="#leaderboard">
            Leaderboard
          </a>
          <a className="navLink" href="#statistics" aria-disabled="true" title="Připravujeme">
            Statistics
          </a>
        </nav>

        <div className="headerActions">
          <DataSourceToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
