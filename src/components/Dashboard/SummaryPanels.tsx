import { formatNumber } from '../../utils/format'
import type { DashboardKpis } from './DashboardSection'

function Panel({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="panel panel--kpi">
      <div className="kpiValue">{value}</div>
      <div className="kpiLabel">{label}</div>
      {sub ? <div className="kpiSub">{sub}</div> : null}
    </div>
  )
}

export function SummaryPanels({ kpis, loading }: { kpis: DashboardKpis; loading: boolean }) {
  if (loading) {
    return (
      <div className="kpiGrid" aria-busy="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="panel panel--kpi skeleton" />
        ))}
      </div>
    )
  }

  return (
    <div className="kpiGrid">
      <Panel label="Počet hráčů" value={formatNumber(kpis.playerCount)} />
      <Panel label="Odehrané hry" value={formatNumber(kpis.gamesTotal)} />
      <Panel label="Průměrné ELO" value={formatNumber(Math.round(kpis.eloAvg))} sub="(za všechny hráče)" />
      <Panel label="Top ELO" value={formatNumber(kpis.topElo)} />
    </div>
  )
}
