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
      {/* Mosaic dashboard (no overlaps): news slider + distribution chart + stats panels */}
      <div className="h-full min-h-0 grid grid-cols-12 grid-rows-6 gap-5">
        {/* Top-left: News slider */}
        <div className="col-span-12 lg:col-span-4 row-span-2 min-h-0">
          <NewsSlider />
        </div>

        {/* Right: Main chart (spans upper area) */}
        <div className="col-span-12 lg:col-span-8 row-span-4 min-h-0">
          <EloDistributionChart players={players} />
        </div>

        {/* Left middle: 4 stats panels (2x2) under the slider */}
        <div className="col-span-12 lg:col-span-4 row-span-2 min-h-0 grid grid-cols-1 sm:grid-cols-2 grid-rows-2 gap-5">
          <DashboardStatPanels stats={stats} loading={loading} range={[0, 4]} />
        </div>

        {/* Bottom row: 4 more stats panels */}
        <div className="col-span-12 row-span-2 min-h-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          <DashboardStatPanels stats={stats} loading={loading} range={[4, 8]} />
        </div>
      </div>
    </motion.div>
  )
}
