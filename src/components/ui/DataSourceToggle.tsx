export type StandingsSource = "ELO" | "DCPR";

/**
 * ELO/DCPR toggle (animated)
 * - Sliding thumb via CSS var (--source-x)
 * - Animates only transform (GPU-friendly)
 */
export function DataSourceToggle({
  value,
  onChange,
}: {
  value: StandingsSource;
  onChange: (v: StandingsSource) => void;
}) {
  const x = value === "ELO" ? "0px" : "calc(100% + 4px)"; // +4 accounts for gap-less layout inside

  return (
    <div className="sourceToggle" style={{ ["--source-x" as any]: x }} role="group" aria-label="Data source">
      <button
        className={`sourceBtn ${value === "ELO" ? "active" : ""}`}
        onClick={() => onChange("ELO")}
        type="button"
        aria-pressed={value === "ELO"}
      >
        ELO
      </button>
      <button
        className={`sourceBtn ${value === "DCPR" ? "active" : ""}`}
        onClick={() => onChange("DCPR")}
        type="button"
        aria-pressed={value === "DCPR"}
      >
        DCPR
      </button>
    </div>
  );
}
