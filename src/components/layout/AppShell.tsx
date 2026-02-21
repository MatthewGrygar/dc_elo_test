import React, { useMemo, useState } from 'react';
import { useAppPreferences } from '../../context/AppPreferencesContext';
import { Header } from './Header';
import { BannerSlider } from './BannerSlider';
import { DashboardSection } from '../dashboard/DashboardSection';
import { LeaderboardSection } from '../leaderboard/LeaderboardSection';
import type { Player } from '../../types/player';
import { PlayerModal } from '../player/PlayerModal';
import { useStandings } from '../../hooks/useStandings';

export function AppShell() {
  const { dataSource } = useAppPreferences();
  const { players, totalPlayers, totalGames, avgElo, topElo, isLoading, error } =
    useStandings(dataSource);

  const [selected, setSelected] = useState<Player | null>(null);

  const kpis = useMemo(
    () => [
      { label: 'Počet hráčů', value: totalPlayers, format: 'int' as const },
      { label: 'Odehrané hry', value: totalGames, format: 'int' as const },
      { label: 'Průměrné ELO', value: avgElo, format: 'float' as const },
      { label: 'Top ELO', value: topElo, format: 'int' as const }
    ],
    [totalPlayers, totalGames, avgElo, topElo]
  );

  return (
    <div className="app">
      <Header />
      <main className="main">
        <BannerSlider />
        <DashboardSection kpis={kpis} players={players} isLoading={isLoading} error={error} />
        <LeaderboardSection
          players={players}
          isLoading={isLoading}
          error={error}
          onSelectPlayer={setSelected}
        />
      </main>

      <PlayerModal player={selected} onClose={() => setSelected(null)} />

      <footer className="footer">
        <div className="footer__inner">
          <span>DC ELO Dashboard 2.0</span>
          <span className="muted">
            Data source: <strong>{dataSource}</strong>
          </span>
        </div>
      </footer>
    </div>
  );
}
