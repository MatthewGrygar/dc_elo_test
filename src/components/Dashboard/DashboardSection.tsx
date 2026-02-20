import { SummaryPanels } from "./SummaryPanels";
import { ChartsGrid } from "./ChartsGrid";

export function DashboardSection() {
  return (
    <section id="dashboard" className="section">
      <div className="container">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <h2 style={{ margin: "0 0 10px", fontSize: 18, letterSpacing: "-0.01em" }}>
            Dashboard
          </h2>
          <div className="muted" style={{ fontSize: 13 }}>
            Placeholder grafy • Reálná data přidáme v další iteraci
          </div>
        </div>

        <SummaryPanels />
        <ChartsGrid />
      </div>
    </section>
  );
}
