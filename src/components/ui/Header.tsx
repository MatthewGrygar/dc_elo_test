import { ThemeToggle } from "../theme/ThemeToggle";

/**
 * Top navigation.
 * Links are anchors for now; later we can upgrade to a router without changing layout.
 */
export function Header() {
  return (
    <header className="topbar panel panel--soft">
      <div className="topbarLeft">
        <div className="logoMark" aria-hidden>
          DC
        </div>
        <div className="logoText">
          <div className="logoTitle">DC ELO</div>
          <div className="logoSub">Analytický dashboard</div>
        </div>
      </div>

      <nav className="topnav" aria-label="Primary">
        <a href="#dashboard" className="navLink">
          Dashboard
        </a>
        <a href="#charts" className="navLink">
          Grafy
        </a>
        <a href="#leaderboard" className="navLink">
          Leaderboard
        </a>
      </nav>

      <div className="topbarRight">
        <ThemeToggle />
      </div>
    </header>
  );
}
