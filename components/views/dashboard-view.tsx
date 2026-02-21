"use client"

import { motion } from "framer-motion"
import type { Player } from "@/types/player"
import { OverviewPanels } from "@/components/dashboard/overview-panels"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { EloDistributionChart } from "@/components/charts/elo-distribution-chart"
import { ChartsGrid } from "@/components/charts/charts-grid"
import { PlaceholderBlocks } from "@/components/views/placeholder-blocks"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
}

export function DashboardView({ players, loading }: { players: Player[]; loading?: boolean }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="h-full overflow-auto px-4 pb-6"
    >
      <div className="pt-2 space-y-6">
        <OverviewPanels players={players} />

        <KpiCards players={players} loading={loading} />

        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 xl:col-span-7">
            <EloDistributionChart players={players} />
          </div>
          <div className="col-span-12 xl:col-span-5">
            <PlaceholderBlocks />
          </div>
        </div>

        <ChartsGrid />
      </div>
    </motion.div>
  )
}
