import { SummaryPanels } from './SummaryPanels';
import { ChartsGrid } from './ChartsGrid';

export function DashboardSection({ kpis }: { kpis: { countPlayers: number; games: number; avgElo: number; topElo: number } }) {
  return (
    <section id="dashboard" className="section" aria-label="Dashboard">
      <div className="section__header">
        <h2 className="section__title">Dashboard</h2>
        <p className="section__hint">Přehledné KPI a základní grafy (placeholdery připravené k rozšíření).</p>
      </div>

      <SummaryPanels kpis={kpis} />
      <ChartsGrid />
    </section>
  );
}
