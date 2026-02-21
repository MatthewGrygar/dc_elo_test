"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"

import { Sidebar, type ViewKey } from "@/components/shell/sidebar"
import { Topbar } from "@/components/shell/topbar"
import { DashboardView } from "@/components/views/dashboard-view"
import { LeaderboardView } from "@/components/views/leaderboard-view"
import { StatsView } from "@/components/views/stats-view"
import { PlayerView } from "@/components/views/player-view"

import { useRating } from "@/components/providers/rating-provider"
import { useStandings } from "@/lib/use-standings"
import type { Player } from "@/types/player"

export default function Page() {
  const { mode } = useRating()
  const { players, loading, error } = useStandings(mode)

  const [view, setView] = React.useState<ViewKey>("dashboard")
  const [query, setQuery] = React.useState("")
  const [selectedPlayer, setSelectedPlayer] = React.useState<Player | null>(null)
  const [lastListView, setLastListView] = React.useState<ViewKey>("leaderboard")

  return (
    <main className="h-screen overflow-hidden">
      {/* background layers */}
      <div className="fixed inset-0 -z-20 bg-background" />
      <div className="fixed inset-0 -z-10 bg-dash-light dark:bg-transparent" />

      <div className="h-full w-full flex">
        <Sidebar view={view} setView={(v) => { setView(v); if (v !== "player") setSelectedPlayer(null) }} />

        <div className="flex-1 h-full pr-3 py-3">
          <div className="glass card-edge rounded-3xl h-full flex flex-col overflow-hidden">
            <Topbar query={query} setQuery={setQuery} />

            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {view === "dashboard" && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.35 }}
                    className="h-full"
                  >
                    <DashboardView players={players} loading={loading} />
                  </motion.div>
                )}

                {view === "stats" && (
                  <motion.div key="stats" className="h-full">
                    <StatsView players={players} />
                  </motion.div>
                )}

                {view === "leaderboard" && (
                  <motion.div key="leaderboard" className="h-full">
                    <LeaderboardView
                      players={players}
                      loading={loading}
                      error={error}
                      query={query}
                      onSelect={(p) => {
                        setSelectedPlayer(p)
                        setLastListView("leaderboard")
                        setView("player")
                      }

{view === "player" && selectedPlayer && (
  <motion.div key="player" className="h-full">
    <PlayerView
      player={selectedPlayer}
      onBack={() => {
        setView(lastListView)
      }}
    />
  </motion.div>
)}
}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
