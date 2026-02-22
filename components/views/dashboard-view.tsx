"use client"

import * as React from "react"
import { motion } from "framer-motion"
import type { Player } from "@/types/player"
import { EloDistributionChart } from "@/components/charts/elo-distribution-chart"
import { NewsSlider } from "@/components/dashboard/news-slider"
import { DashboardStatPanels } from "@/components/dashboard/stats-panels"
import { BestPlayerPanel } from "@/components/dashboard/best-player-panel"
import { InterestingMatchesPanel } from "@/components/dashboard/interesting-matches-panel"
import { useRating } from "@/components/providers/rating-provider"
import { useDashboardStats } from "@/lib/use-dashboard-stats"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
}

export function DashboardView({ players }: { players: Player[]; loading?: boolean }) {
  const { mode } = useRating()
  const ratings = React.useMemo(
    () =>
      players
        .map((p) => (mode === "elo" ? p.elo : p.dcpr))
        .filter((n) => Number.isFinite(n) && n > 0),
    [players, mode]
  )

  const medianRating = React.useMemo(() => {
    const xs = [...ratings].sort((a, b) => a - b)
    if (!xs.length) return 0
    const mid = Math.floor(xs.length / 2)
    const m = xs.length % 2 === 0 ? (xs[mid - 1] + xs[mid]) / 2 : xs[mid]
    return Math.round(m)
  }, [ratings])

  const { stats, loading } = useDashboardStats(mode, medianRating)

  const bestPlayer = React.useMemo(() => {
    const sorted = [...players].sort((a, b) => {
      const ra = mode === "elo" ? a.elo : a.dcpr
      const rb = mode === "elo" ? b.elo : b.dcpr
      return rb - ra
    })
    return sorted[0] ?? null
  }, [players, mode])

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="h-full overflow-hidden px-4 pb-4 pt-2"
    >
      {/* Mosaic dashboard (no overlaps) */}
      <div className="h-full min-h-0 grid grid-cols-12 grid-rows-6 gap-5">
        {/* Bigger top-left: News + updates */}
        <div className="col-span-12 lg:col-span-4 row-span-3 min-h-0">
          <NewsSlider />
        </div>

        {/* Stats mosaic (uniform tiles) */}
        <div className="col-span-12 lg:col-span-8 row-span-3 min-h-0 grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-5">
          <DashboardStatPanels stats={stats} loading={loading} range={[0, 8]} uniform />
        </div>

        {/* Bottom-left stack: Best player + interesting matches */}
        <div className="col-span-12 lg:col-span-4 row-span-3 min-h-0 grid grid-rows-2 gap-5">
          <div className="min-h-0">
            <BestPlayerPanel player={bestPlayer} mode={mode} />
          </div>
          <div className="min-h-0">
            <InterestingMatchesPanel stats={stats} />
          </div>
        </div>

        {/* Distribution chart bottom-right */}
        <div className="col-span-12 lg:col-span-8 row-span-3 min-h-0">
          <EloDistributionChart players={players} />
        </div>
      </div>
    </motion.div>
  )
}
