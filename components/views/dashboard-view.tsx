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
      className="h-full overflow-hidden px-4 pb-4 pt-2"
    >
      <div className="h-full grid grid-rows-[220px_140px_1fr] gap-5 min-h-0">
        <div className="min-h-0">
          <OverviewPanels players={players} />
        </div>
        <div className="min-h-0">
          <KpiCards players={players} loading={loading} />
        </div>
        <div className="grid grid-cols-12 gap-5 min-h-0">
          <div className="col-span-12 xl:col-span-7 min-h-0">
            <EloDistributionChart players={players} />
          </div>
          <div className="col-span-12 xl:col-span-5 min-h-0 grid grid-rows-2 gap-5">
            <PlaceholderBlocks compact />
            <ChartsGrid compact />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
