import { Activity, BarChart3, Gauge, TrendingUp, Users } from 'lucide-react'
import { MiniChartCard } from '../charts/MiniChartCard'
import { WideChartCard } from '../charts/WideChartCard'

export function ChartsGrid({ loading }: { loading: boolean }) {
  // Placeholder series – replace with real aggregated data later.
  const series = Array.from({ length: 14 }).map((_, i) => ({
    day: `D${i + 1}`,
    value: Math.round(40 + 20 * Math.sin(i / 2) + i * 1.4)
  }))

  const dist = Array.from({ length: 10 }).map((_, i) => ({
    bucket: `${1200 + i * 100}`,
    count: Math.max(1, Math.round(6 + 5 * Math.cos(i / 1.8)))
  }))

  return (
    <div className="chartsGrid" id="statistics">
      <WideChartCard
        title="Aktivita (placeholder)"
        subtitle="Počet her v čase – pro první verzi demo data"
        icon={<Activity size={18} />}
        loading={loading}
        data={series}
      />

      <MiniChartCard
        title="Rozdělení ELO"
        subtitle="Histogram (placeholder)"
        icon={<BarChart3 size={18} />}
        loading={loading}
        kind="bar"
        data={dist}
      />

      <MiniChartCard
        title="Trend výkonu"
        subtitle="Line (placeholder)"
        icon={<TrendingUp size={18} />}
        loading={loading}
        kind="line"
        data={series.slice(-8)}
      />

      <MiniChartCard
        title="Winrate"
        subtitle="Gauge (placeholder)"
        icon={<Gauge size={18} />}
        loading={loading}
        kind="gauge"
        data={series}
      />

      <MiniChartCard
        title="Aktivní hráči"
        subtitle="7d (placeholder)"
        icon={<Users size={18} />}
        loading={loading}
        kind="spark"
        data={series.slice(-10)}
      />
    </div>
  )
}
