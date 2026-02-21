"use client"

import { motion } from "framer-motion"
import type { Player } from "@/types/player"
import { LeaderboardSection } from "@/components/leaderboard/leaderboard-section"

export function LeaderboardView({
  players,
  loading,
  error,
  query,
  onSelect
}: {
  players: Player[]
  loading?: boolean
  error?: string | null
  query: string
  onSelect: (p: Player) => void
}) {
  const q = query.trim().toLowerCase()
  const filtered = q ? players.filter((p) => p.name.toLowerCase().includes(q)) : players

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35 }}
      className="h-full overflow-auto px-4 pb-6"
    >
      <div className="pt-2">
        <LeaderboardSection players={filtered} loading={loading} error={error} onSelect={onSelect} />
      </div>
    </motion.div>
  )
}
