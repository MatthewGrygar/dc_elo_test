"use client"

import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar/navbar"
import { HeroSlider } from "@/components/slider/hero-slider"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { OverviewPanels } from "@/components/dashboard/overview-panels"
import { EloDistributionChart } from "@/components/charts/elo-distribution-chart"
import { ChartsGrid } from "@/components/charts/charts-grid"
import { LeaderboardSection } from "@/components/leaderboard/leaderboard-section"
import { useRating } from "@/components/providers/rating-provider"
import { useStandings } from "@/lib/use-standings"

export default function Page() {
  const { mode } = useRating()
  const { players, loading, error } = useStandings(mode)

  return (
    <main className="min-h-screen">
      <div className="fixed inset-0 -z-10 bg-dash-light dark:bg-transparent" />
      <div className="fixed inset-0 -z-20 bg-background" />

      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container pt-6 md:pt-8 pb-16 space-y-8 md:space-y-10"
      >
        <HeroSlider />

        <section id="dashboard" className="scroll-mt-24 space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="section-title">Dashboard</h2>
              <p className="subtle">Základní přehled a rychlé metriky pro aktuální sezónu.</p>
            </div>
          </div>

          <OverviewPanels players={players} />

          <div className="pt-1">
            <KpiCards players={players} loading={loading} />
          </div>
        </section>

        <section id="statistics" className="scroll-mt-24 space-y-4">
          <div>
            <h2 className="section-title">Statistics</h2>
            <p className="subtle">Rozložení ratingu a vývoj v čase (mock data, připraveno na API).</p>
          </div>

          <EloDistributionChart players={players} />
          <ChartsGrid />
        </section>

        <section id="leaderboard" className="scroll-mt-24 space-y-4">
          <div>
            <h2 className="section-title">Leaderboard</h2>
            <p className="subtle">Klikni na hráče pro detail v postranním panelu.</p>
          </div>

          <LeaderboardSection players={players} loading={loading} error={error} />
        </section>
      </motion.div>
    </main>
  )
}
