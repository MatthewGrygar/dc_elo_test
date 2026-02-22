"use client"

import { motion } from "framer-motion"
import type { Player } from "@/types/player"
import { EloDistributionChart } from "@/components/charts/elo-distribution-chart"
import { NewsSlider } from "@/components/dashboard/news-slider"
import { DashboardStatPanels } from "@/components/dashboard/stats-panels"
import { useRating } from "@/components/providers/rating-provider"
import { useDashboardStats } from "@/lib/use-dashboard-stats"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
}

export function DashboardView({ players }: { players: Player[]; loading?: boolean }) {
  const { mode } = useRating()
  const ratings = players
    .map((p) => (mode === "elo" ? p.elo : p.dcpr))
    .filter((n) => Number.isFinite(n) && n > 0)
  const { stats, loading } = useDashboardStats(mode, ratings)

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="h-full overflow-hidden px-4 pb-4 pt-2"
    >
      {/* Mosaic dashboard (no overlaps): top row = news + KPIs, middle row = KPIs, bottom = chart */}
      <div className="h-full min-h-0 grid grid-cols-12 grid-rows-6 gap-5">
        {/* Top-left: News slider (wider for 16:9) */}
        <div className="col-span-12 lg:col-span-5 row-span-2 min-h-0">
          <NewsSlider />
        </div>

        {/* Top-right: 4 KPI panels (2x2) aligned with slider height */}
        <div className="col-span-12 lg:col-span-7 row-span-2 min-h-0 grid grid-cols-1 sm:grid-cols-2 grid-rows-2 gap-5">
          <DashboardStatPanels stats={stats} loading={loading} range={[0, 4]} />
        </div>

        {/* Middle: 4 more KPI panels (single row on desktop) */}
        <div className="col-span-12 row-span-2 min-h-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <DashboardStatPanels stats={stats} loading={loading} range={[4, 8]} />
        </div>

        {/* Bottom: Distribution chart (full width to avoid any overlap in different modes) */}
        <div className="col-span-12 row-span-2 min-h-0">
          <EloDistributionChart players={players} />
        </div>
      </div>
    </motion.div>
  )
}
