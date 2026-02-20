import { Player } from "../../types/player";
import { SummaryPanels } from "./SummaryPanels";
import { ChartsGrid } from "./ChartsGrid";

export function DashboardSection({ players }: { players: Player[] }) {
  return (
    <section id="dashboard" className="section">
      <div className="sectionHeader">
        <h2 className="sectionTitle">Dashboard</h2>
        <p className="sectionSubtitle">Rychlý přehled statistik + placeholder grafy.</p>
      </div>

      <SummaryPanels players={players} />
      <ChartsGrid players={players} />
    </section>
  );
}
