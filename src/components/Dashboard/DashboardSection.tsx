import type { DataSource } from '../../types/core'
import { SummaryPanels } from './SummaryPanels'
import { ChartsGrid } from './ChartsGrid'

export type DashboardKpis = {
  playerCount: number
  gamesTotal: number
  eloAvg: number
  topElo: number
}

export function DashboardSection({
  kpis,
  loading,
  error,
  dataSource
}: {
  kpis: DashboardKpis
  loading: boolean
  error: string | null
  dataSource: DataSource
}) {
  return (
    <section id="dashboard" className="section">
      <div className="sectionHeader">
        <h2 className="sectionTitle">Dashboard</h2>
        <div className="sectionHint">
          Zdroj: <span className="kbd">{dataSource}</span>
        </div>
      </div>

      <SummaryPanels kpis={kpis} loading={loading} />

      {error ? (
        <div className="panel panel--soft notice">
          <div className="noticeTitle">Nepodařilo se načíst data</div>
          <div className="noticeBody">{error}</div>
        </div>
      ) : null}

      <ChartsGrid loading={loading} />
    </section>
  )
}
