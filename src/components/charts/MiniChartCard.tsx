import type { ReactNode } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

type AnyPoint = Record<string, string | number>

type Kind = 'bar' | 'line' | 'gauge' | 'spark'

export function MiniChartCard({
  title,
  subtitle,
  icon,
  loading,
  kind,
  data
}: {
  title: string
  subtitle: string
  icon: ReactNode
  loading: boolean
  kind: Kind
  data: AnyPoint[]
}) {
  return (
    <div className="panel panel--chart">
      <div className="chartHeader">
        <div className="chartTitle">
          <span className="chartIcon" aria-hidden="true">
            {icon}
          </span>
          <div>
            <div className="chartName">{title}</div>
            <div className="chartSub">{subtitle}</div>
          </div>
        </div>
      </div>

      <div className="chartBody chartBody--mini">
        {loading ? (
          <div className="chartSkeleton" />
        ) : kind === 'bar' ? (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeOpacity={0.12} vertical={false} />
              <XAxis dataKey={Object.keys(data[0] ?? {})[0]} tickMargin={8} strokeOpacity={0.55} />
              <YAxis tickMargin={8} strokeOpacity={0.55} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(10,10,12,0.65)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 12
                }}
              />
              <Bar dataKey={Object.keys(data[0] ?? {})[1]} fill="var(--accent-2)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : kind === 'line' || kind === 'spark' ? (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={data} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeOpacity={kind === 'spark' ? 0 : 0.12} vertical={false} />
              <XAxis
                dataKey={Object.keys(data[0] ?? {})[0]}
                tickMargin={8}
                strokeOpacity={kind === 'spark' ? 0 : 0.55}
                tick={kind === 'spark' ? false : undefined}
              />
              <YAxis
                tickMargin={8}
                strokeOpacity={kind === 'spark' ? 0 : 0.55}
                tick={kind === 'spark' ? false : undefined}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(10,10,12,0.65)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 12
                }}
              />
              <Line
                type="monotone"
                dataKey={Object.keys(data[0] ?? {})[1]}
                stroke="var(--accent-1)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <GaugePlaceholder />
        )}
      </div>
    </div>
  )
}

function GaugePlaceholder() {
  return (
    <div className="gauge">
      <div className="gaugeRing" />
      <div className="gaugeValue">—</div>
      <div className="gaugeHint">Placeholder</div>
    </div>
  )
}
