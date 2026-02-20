import { ThemeToggle } from "../theme/ThemeToggle";
import { DataSourceToggle, StandingsSource } from "./DataSourceToggle";

export function Header({
  standingsSource,
  onStandingsSourceChange,
}: {
  standingsSource: StandingsSource;
  onStandingsSourceChange: (v: StandingsSource) => void;
}) {
  return (
    <header className="topbar">
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

      <div className="topbarRight" style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <DataSourceToggle value={standingsSource} onChange={onStandingsSourceChange} />
        <ThemeToggle />
      </div>
    </header>
  );
}
