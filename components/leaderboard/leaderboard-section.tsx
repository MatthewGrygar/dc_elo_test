"use client"

import * as React from "react"
import { players } from "@/data/mockPlayers"
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table"
import { PlayerSheet } from "@/components/sheet/player-sheet"
import type { Player } from "@/types/player"

export function LeaderboardSection() {
  const [selected, setSelected] = React.useState<Player | null>(null)

  return (
    <>
      <LeaderboardTable players={players} onSelect={(p) => setSelected(p)} />
      <PlayerSheet player={selected} onClose={() => setSelected(null)} />
    </>
  )
}
