"use client"

import { motion } from "framer-motion"
import type { Player } from "@/types/player"
import { EloDistributionChart } from "@/components/charts/elo-distribution-chart"
import { ChartsGrid } from "@/components/charts/charts-grid"

export function StatsView({ players }: { players: Player[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35 }}
      className="h-full overflow-auto px-4 pb-6"
    >
      <div className="pt-2 space-y-5">
        <EloDistributionChart players={players} />
        <ChartsGrid />
      </div>
    </motion.div>
  )
}
