"use client"

import * as React from "react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, LineChart, Line } from "recharts"
import { charts } from "@/data/mockCharts"
import { ChartShell, type RangeKey } from "@/components/charts/chart-shell"

function sliceByRange(data: any[], range: RangeKey) {
  const n =
    range === "7d" ? 7 :
    range === "30d" ? 30 :
    range === "3m" ? 90 :
    180
  return data.slice(-n)
}

function TTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border bg-popover px-3 py-2 shadow-md">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{payload[0].value}</div>
    </div>
  )
}

export function ChartsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <ChartShell title="Average rating (trend)">
        {(range) => (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sliceByRange(charts.avgRating, range)} margin={{ top: 8, right: 10, left: -12, bottom: 0 }}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip content={<TTip />} />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1) / 0.25)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartShell>

      <ChartShell title="Games activity">
        {(range) => (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sliceByRange(charts.activity, range)} margin={{ top: 8, right: 10, left: -12, bottom: 0 }}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip content={<TTip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartShell>

      <ChartShell title="New players (mock)">
        {(range) => (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sliceByRange(charts.newPlayers, range)} margin={{ top: 8, right: 10, left: -12, bottom: 0 }}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip content={<TTip />} />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartShell>

      <ChartShell title="Winrate trend (mock)">
        {(range) => (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sliceByRange(charts.winrateTrend, range)} margin={{ top: 8, right: 10, left: -12, bottom: 0 }}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip content={<TTip />} />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2) / 0.25)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartShell>
    </div>
  )
}
