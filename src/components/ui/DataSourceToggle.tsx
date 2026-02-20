export type StandingsSource = "ELO" | "DCPR";

/**
 * ELO/DCPR toggle (source of truth for dashboard data).
 * Presentational: parent owns the state.
 */
export function DataSourceToggle({
  value,
  onChange,
}: {
  value: StandingsSource;
  onChange: (v: StandingsSource) => void;
}) {
  return (
    <div className="sourceToggle" role="group" aria-label="Data source">
      <button
        className={`sourceBtn ${value === "ELO" ? "active" : ""}`}
        onClick={() => onChange("ELO")}
        type="button"
      >
        ELO
      </button>
      <button
        className={`sourceBtn ${value === "DCPR" ? "active" : ""}`}
        onClick={() => onChange("DCPR")}
        type="button"
      >
        DCPR
      </button>
    </div>
  );
}
