"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useRating } from "@/components/providers/rating-provider"
import type { Player } from "@/types/player"

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border bg-popover px-3 py-2 shadow-md">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{payload[0].value} hráčů</div>
    </div>
  )
}

export function EloDistributionChart({ players }: { players: Player[] }) {
  const { mode } = useRating()

  const data = React.useMemo(() => {
    // Bin width requirement: 50 rating points.
    const STEP = 50
    const ratings: number[] = []

    for (const p of players) {
      const v = mode === "elo" ? p.elo : p.dcpr
      if (Number.isFinite(v) && v > 0) ratings.push(v)
    }

    if (!ratings.length) return []
    const min = Math.floor(Math.min(...ratings) / STEP) * STEP
    const max = Math.ceil(Math.max(...ratings) / STEP) * STEP
    const bins = new Map<number, number>()
    for (let start = min; start < max; start += STEP) bins.set(start, 0)

    for (const r of ratings) {
      const start = Math.floor((r - min) / STEP) * STEP + min
      if (bins.has(start)) bins.set(start, (bins.get(start) ?? 0) + 1)
    }

    return Array.from(bins.entries()).map(([start, count]) => ({
      range: `${start}-${start + STEP - 1}`,
      count
    }))
  }, [mode, players])

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55 }}
    >
      <Card className={cn("glass card-edge shine rounded-3xl")}>
        <CardHeader>
          <CardTitle>Rozložení {mode.toUpperCase()}</CardTitle>
          <CardDescription>Histogram rozložení ratingu v aktuálním datasetu.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[240px] xl:h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 12, right: 10, left: -10, bottom: 0 }}>
                <XAxis
                  dataKey="range"
                  tickMargin={10}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis
                  tickMargin={8}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={{ stroke: "hsl(var(--border))" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[10, 10, 0, 0]} fill="hsl(var(--chart-1))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Load-in animace + tooltip · Recharts</div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
