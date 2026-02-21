"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { charts } from "@/data/mockCharts"
import { cn } from "@/lib/utils"
import { useRating } from "@/components/providers/rating-provider"

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border bg-popover px-3 py-2 shadow-md">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{payload[0].value} hráčů</div>
    </div>
  )
}

export function EloDistributionChart() {
  const { mode } = useRating()

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55 }}
    >
      <Card className={cn("glass dark:glass rounded-3xl")}>
        <CardHeader>
          <CardTitle>Rozložení {mode.toUpperCase()}</CardTitle>
          <CardDescription>Histogram rozložení ratingu v aktuálním datasetu.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.distribution} margin={{ top: 12, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="range" tickMargin={10} />
                <YAxis tickMargin={8} />
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
