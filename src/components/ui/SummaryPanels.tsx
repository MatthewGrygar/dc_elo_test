import { Player } from "../../types/player";
import { computeSummary } from "../../lib/stats";
import { formatInt } from "../../lib/format";

function SummaryCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="panel card">
      <div className="cardTitle">{title}</div>
      <div className="cardValue">{value}</div>
      <div className="cardHint">{hint}</div>
    </div>
  );
}

export function SummaryPanels({ players }: { players: Player[] }) {
  const s = computeSummary(players);

  return (
    <div className="summaryGrid">
      <SummaryCard title="Hráči" value={formatInt(s.players)} hint="Aktuální počet v leaderboardu" />
      <SummaryCard
        title="Odehrané hry"
        value={formatInt(s.totalGames)}
        hint="Součet Games ze sheetu"
      />
      <SummaryCard
        title="Průměrné ELO"
        value={formatInt(Math.round(s.avgRating))}
        hint="Průměr napříč hráči"
      />
      <SummaryCard title="Top ELO" value={formatInt(s.topRating)} hint="Nejvyšší rating v žebříčku" />
    </div>
  );
}
