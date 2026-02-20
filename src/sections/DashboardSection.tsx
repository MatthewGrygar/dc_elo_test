import type { PlayerRow } from '../types/player';
import { SummaryPanels } from './SummaryPanels';
import { ChartsGrid } from './ChartsGrid';

export function DashboardSection({
  players,
  isLoading
}: {
  players: PlayerRow[];
  isLoading: boolean;
}) {
  return (
    <section id="dashboard" className="stack-xl" aria-label="Dashboard">
      <div className="sectionHeader">
        <h2 className="sectionTitle">Dashboard</h2>
        <p className="sectionSubtitle muted">High-level summary & visual placeholders for upcoming analytics.</p>
      </div>

      <SummaryPanels players={players} isLoading={isLoading} />
      <ChartsGrid players={players} />
    </section>
  );
}
