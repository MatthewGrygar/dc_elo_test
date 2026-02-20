import React from 'react';
import type { PlayerStanding } from '@/types/dc';
import type { ReturnTypeOfUseStandings } from '@/components/types';
import { Header } from '@/components/Header';
import { BannerSlider } from '@/features/dashboard/BannerSlider';
import { DashboardSection } from '@/features/dashboard/DashboardSection';
import { LeaderboardSection } from '@/features/leaderboard/LeaderboardSection';
import { PlayerModal } from '@/features/player/PlayerModal';

/** Small helper type to keep props readable. */
export type StandingsResult = ReturnTypeOfUseStandings;

export function AppShell({ standings }: { standings: StandingsResult }) {
  const [selected, setSelected] = React.useState<PlayerStanding | null>(null);

  return (
    <div className="page">
      <Header />
      <main className="container">
        <BannerSlider />

        <DashboardSection standings={standings} />

        <LeaderboardSection
          standings={standings}
          onSelectPlayer={(p) => setSelected(p)}
        />
      </main>

      <PlayerModal player={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
