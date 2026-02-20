import React from 'react';
import type { StandingsResult } from '@/components/AppShell';
import { computeSummary, makeRatingHistogram, makeWinrateScatter } from '@/lib/stats';
import { SummaryPanels } from '@/features/dashboard/SummaryPanels';
import { ChartsGrid } from '@/features/dashboard/ChartsGrid';

export function DashboardSection({ standings }: { standings: StandingsResult }) {
  const summary = React.useMemo(() => computeSummary(standings.players), [standings.players]);
  const histogram = React.useMemo(
    () => makeRatingHistogram(standings.players, 50),
    [standings.players],
  );
  const scatter = React.useMemo(() => makeWinrateScatter(standings.players), [standings.players]);

  return (
    <section id="dashboard" className="section">
      <div className="sectionHeader">
        <h2 className="sectionTitle">Dashboard</h2>
        <div className="sectionMeta">
          {standings.isLoading ? 'Načítám data…' : standings.error ? 'Chyba načtení' : 'Aktuální data'}
        </div>
      </div>

      {standings.error ? (
        <div className="panel panel--soft errorPanel">
          <div className="errorTitle">Nepodařilo se načíst data z Google Sheets.</div>
          <div className="errorText">{standings.error}</div>
          <div className="errorHint">
            Tip: Sheet musí být veřejný (Anyone with link → Viewer).
          </div>
        </div>
      ) : null}

      <SummaryPanels summary={summary} isLoading={standings.isLoading} />
      <ChartsGrid histogram={histogram} scatter={scatter} />
    </section>
  );
}
