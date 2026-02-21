import { SummaryPanels } from './SummaryPanels';
import { ChartsGrid } from './ChartsGrid';

export function DashboardSection() {
  return (
    <section className="section" id="dashboard" aria-label="Dashboard">
      <div className="section__header">
        <h2 className="section__title">Dashboard</h2>
        <p className="section__subtitle">Shrnutí výkonu a rychlý přehled metrik.</p>
      </div>

      <SummaryPanels />
      <ChartsGrid />
    </section>
  );
}
