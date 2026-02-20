import { StatCard } from "./StatCard";

/**
 * Placeholder stats.
 * Next step: compute from real Sheets data (e.g., player count, total games, avg rating, top peak).
 */
export function StatsRow() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatCard label="Hráčů" value="—" hint="Z Google Sheet" />
      <StatCard label="Zápasů" value="—" hint="Součet Games" />
      <StatCard label="Průměr ELO" value="—" hint="Z Rating" />
      <StatCard label="Rekordní peak" value="—" hint="Max Peak" />
    </div>
  );
}
