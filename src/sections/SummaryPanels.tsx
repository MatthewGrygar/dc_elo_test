import type { PlayerRow } from '../types/player';

export function SummaryPanels({ players, isLoading }: { players: PlayerRow[]; isLoading: boolean }) {
  const totalPlayers = players.length;
  const totalGames = players.reduce((acc, p) => acc + p.games, 0);
  const top = players[0];

  return (
    <div className="summaryGrid" aria-label="Summary">
      <Panel title="Players" value={isLoading ? '—' : String(totalPlayers)} hint="Total in standings" />
      <Panel title="Total games" value={isLoading ? '—' : String(totalGames)} hint="Sum across players" />
      <Panel
        title="Top rating"
        value={isLoading ? '—' : top ? String(top.rating) : '—'}
        hint={top ? top.name : 'Waiting for data'}
        accent="accent"
      />
      <Panel
        title="Data layer"
        value="Google Sheets"
        hint="Public gviz endpoint"
        accent="soft"
      />
    </div>
  );
}

function Panel({
  title,
  value,
  hint,
  accent
}: {
  title: string;
  value: string;
  hint: string;
  accent?: 'accent' | 'soft';
}) {
  return (
    <div className={accent === 'accent' ? 'panel summaryCard isAccent' : 'panel summaryCard'}>
      <div className="summaryTitle muted">{title}</div>
      <div className="summaryValue">{value}</div>
      <div className="summaryHint muted">{hint}</div>
    </div>
  );
}
