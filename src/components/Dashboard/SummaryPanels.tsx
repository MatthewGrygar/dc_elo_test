import { useData } from '../../context/data-context';
import { formatCompactNumber, formatElo } from '../../utils/format';

function Panel({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="panel kpi">
      <div className="kpi__label">{label}</div>
      <div className="kpi__value">{value}</div>
      {hint ? <div className="kpi__hint">{hint}</div> : null}
    </div>
  );
}

export function SummaryPanels() {
  const { stats, dataSource, isLoading, error } = useData();

  const suffix = dataSource === 'ELO' ? 'ELO' : 'DCPR';

  return (
    <div className="kpiGrid" id="statistics">
      <Panel label="Počet hráčů" value={isLoading ? '—' : formatCompactNumber(stats.playersCount)} />
      <Panel label="Odehrané hry" value={isLoading ? '—' : formatCompactNumber(stats.gamesTotal)} />
      <Panel label={`Průměrné ${suffix}`} value={isLoading ? '—' : formatElo(stats.avgElo)} />
      <Panel label={`Top ${suffix}`} value={isLoading ? '—' : formatElo(stats.topElo)} hint={error ? `Chyba načtení: ${error}` : undefined} />
    </div>
  );
}
