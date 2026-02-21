import React from 'react';
import { Panel } from '../common/Panel';
import { ThemeToggle } from './ThemeToggle';
import { DataSourceToggle } from './DataSourceToggle';

const NAV = [
  { href: '#dashboard', label: 'Dashboard' },
  { href: '#leaderboard', label: 'Leaderboard' },
  { href: '#statistics', label: 'Statistics' }
] as const;

export function Header() {
  return (
    <header className="header">
      <Panel variant="soft" className="header__panel">
        <div className="header__left">
          <a className="brand" href="#dashboard">
            <img className="brand__logo" src="./logo.svg" alt="DC ELO" />
            <div className="brand__text">
              <div className="brand__title">DC ELO</div>
              <div className="brand__sub">Dashboard 2.0</div>
            </div>
          </a>

          <nav className="nav" aria-label="Navigace">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="nav__link">
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="header__right">
          <DataSourceToggle />
          <ThemeToggle />
        </div>
      </Panel>
    </header>
  );
}
