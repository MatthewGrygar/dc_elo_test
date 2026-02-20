import React from 'react';
import { Header } from './Header';
import { BannerSlider } from './BannerSlider';
import { DashboardSection } from '../sections/DashboardSection';
import { LeaderboardSection } from '../sections/LeaderboardSection';
import { PlayerModal } from './PlayerModal';
import { useLeaderboard } from '../lib/useLeaderboard';
import type { PlayerRow } from '../types/player';

export function AppShell() {
  const leaderboard = useLeaderboard();

  const [selected, setSelected] = React.useState<PlayerRow | null>(null);

  return (
    <div className="page">
      <Header onRefresh={leaderboard.refresh} refreshedAt={leaderboard.refreshedAt} />
      <main className="container stack-xl">
        <BannerSlider />
        <DashboardSection players={leaderboard.players} isLoading={leaderboard.isLoading} />
        <LeaderboardSection
          players={leaderboard.players}
          isLoading={leaderboard.isLoading}
          error={leaderboard.error}
          onSelectPlayer={setSelected}
        />
      </main>

      <PlayerModal player={selected} onClose={() => setSelected(null)} />

      <footer className="footer">
        <div className="container footerInner">
          <span className="muted">DC ELO 2.0 · v2.3.0</span>
          <span className="muted">Data source: Google Sheets</span>
        </div>
      </footer>
    </div>
  );
}
