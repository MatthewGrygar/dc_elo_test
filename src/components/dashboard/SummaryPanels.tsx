function formatInt(x: number) {
  return Math.round(x).toLocaleString('cs-CZ');
}

export function SummaryPanels({ kpis }: { kpis: { countPlayers: number; games: number; avgElo: number; topElo: number } }) {
  return (
    <div className="summary">
      <div className="panel summary__card">
        <div className="summary__value">{formatInt(kpis.countPlayers)}</div>
        <div className="summary__label">Počet hráčů</div>
      </div>

      <div className="panel summary__card">
        <div className="summary__value">{formatInt(kpis.games)}</div>
        <div className="summary__label">Odehrané hry</div>
      </div>

      <div className="panel summary__card">
        <div className="summary__value">{formatInt(kpis.avgElo)}</div>
        <div className="summary__label">Průměrné ELO</div>
      </div>

      <div className="panel summary__card">
        <div className="summary__value">{formatInt(kpis.topElo)}</div>
        <div className="summary__label">Top ELO</div>
      </div>
    </div>
  );
}
