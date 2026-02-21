"use client"

import * as React from "react"
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table"
import { PlayerSheet } from "@/components/sheet/player-sheet"
import type { Player } from "@/types/player"

export function LeaderboardSection({ players, loading, error }: { players: Player[]; loading?: boolean; error?: string | null }) {
  const [selected, setSelected] = React.useState<Player | null>(null)

  return (
    <>
      {error ? (
        <div className="rounded-3xl border p-4 glass dark:glass text-sm">
          <div className="font-semibold">Nepodařilo se načíst leaderboard</div>
          <div className="text-muted-foreground mt-1">{error}</div>
        </div>
      ) : loading ? (
        <div className="rounded-3xl border p-4 glass dark:glass text-sm text-muted-foreground">
          Načítám leaderboard z Google Sheets…
        </div>
      ) : (
        <LeaderboardTable players={players} onSelect={(p) => setSelected(p)} />
      )}
      <PlayerSheet player={selected} onClose={() => setSelected(null)} />
    </>
  )
}
