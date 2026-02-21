"use client"

import { motion } from "framer-motion"
import type { Player } from "@/types/player"
import { EloDistributionChart } from "@/components/charts/elo-distribution-chart"
import { NewsSlider } from "@/components/dashboard/news-slider"
import { PlaceholderPanel, placeholderItems } from "@/components/dashboard/placeholder-panels"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
}

export function DashboardView({ players }: { players: Player[]; loading?: boolean }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="h-full overflow-hidden px-4 pb-4 pt-2"
    >
      {/* Mosaic dashboard (no overlaps): small news slider top-left + distribution chart + 5 placeholder panels */}
      <div className="h-full min-h-0 grid grid-cols-12 grid-rows-6 gap-5">
        {/* Top-left: News slider */}
        <div className="col-span-12 lg:col-span-4 row-span-2 min-h-0">
          <NewsSlider />
        </div>

        {/* Right: Main chart (spans upper area) */}
        <div className="col-span-12 lg:col-span-8 row-span-4 min-h-0">
          <EloDistributionChart players={players} />
        </div>

        {/* Left middle: two stacked panels under the slider */}
        <div className="col-span-12 lg:col-span-4 row-span-2 min-h-0 grid grid-rows-2 gap-5">
          <PlaceholderPanel item={placeholderItems[0]} />
          <PlaceholderPanel item={placeholderItems[1]} />
        </div>

        {/* Bottom row: 3 panels */}
        <div className="col-span-12 row-span-2 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-5">
          <PlaceholderPanel item={placeholderItems[2]} />
          <PlaceholderPanel item={placeholderItems[3]} />
          <PlaceholderPanel item={placeholderItems[4]} />
        </div>
      </div>
    </motion.div>
  )
}
