import React from 'react';
import { useAppState } from '@/app/state';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DataSourceToggle } from '@/components/DataSourceToggle';

export function Header() {
  const { theme, toggleTheme, dataSource, setDataSource } = useAppState();

  return (
    <header className="topbar">
      <div className="topbarInner">
        <div className="brand">
          <div className="brandMark" aria-hidden="true" />
          <div className="brandText">
            <div className="brandTitle">DC ELO</div>
            <div className="brandSub">by Grail Series</div>
          </div>
        </div>

        <nav className="nav" aria-label="Primary">
          <a className="navLink" href="#dashboard">
            Dashboard
          </a>
          <a className="navLink" href="#leaderboard">
            Leaderboard
          </a>
          <a className="navLink" href="#statistics">
            Statistics
          </a>
        </nav>

        <div className="topbarActions">
          <DataSourceToggle value={dataSource} onChange={setDataSource} />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </div>
    </header>
  );
}
