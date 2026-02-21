"use client"

import { motion } from "framer-motion"
import type { Player } from "@/types/player"
import { PlayerPanel } from "@/components/player/player-panel"

export function PlayerView({
  player,
  onBack
}: {
  player: Player
  onBack: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35 }}
      className="h-full overflow-hidden px-4 pb-6"
    >
      <div className="pt-2 h-full">
        <PlayerPanel player={player} onBack={onBack} />
      </div>
    </motion.div>
  )
}
