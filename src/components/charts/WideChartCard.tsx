import type { ReactNode } from "react"
import {
  
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

type Point = { day: string; value: number }

export function WideChartCard({
  title,
  subtitle,
  icon,
  loading,
  data
}: {
  title: string
  subtitle: string
  icon: ReactNode
  loading: boolean
  data: Point[]
}) {
  return (
    <div className="panel panel--chart panel--wide">
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

      <div className="chartBody">
        {loading ? (
          <div className="chartSkeleton" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeOpacity={0.15} vertical={false} />
              <XAxis dataKey="day" tickMargin={8} strokeOpacity={0.55} />
              <YAxis tickMargin={8} strokeOpacity={0.55} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(10,10,12,0.65)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 12
                }}
                labelStyle={{ color: 'rgba(245,246,247,0.85)' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--accent-1)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
