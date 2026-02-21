import React, { useMemo, useState } from 'react';
import { Header } from '../Header/Header';
import { BannerSlider } from '../BannerSlider/BannerSlider';
import { DashboardSection } from '../Dashboard/DashboardSection';
import { LeaderboardSection } from '../Leaderboard/LeaderboardSection';
import { PlayerModal } from '../PlayerModal/PlayerModal';
import type { Player } from '../../types/player';

export type AppShellState = {
  selectedPlayer: Player | null;
  openPlayer: (p: Player) => void;
  closePlayer: () => void;
};

export const AppShellContext = React.createContext<AppShellState | null>(null);

export function AppShell() {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const value = useMemo<AppShellState>(
    () => ({
      selectedPlayer,
      openPlayer: (p) => setSelectedPlayer(p),
      closePlayer: () => setSelectedPlayer(null),
    }),
    [selectedPlayer],
  );

  return (
    <AppShellContext.Provider value={value}>
      <div className="appShell">
        <Header />
        <main className="main">
          <BannerSlider />
          <DashboardSection />
          <LeaderboardSection />
        </main>
        <PlayerModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      </div>
    </AppShellContext.Provider>
  );
}
