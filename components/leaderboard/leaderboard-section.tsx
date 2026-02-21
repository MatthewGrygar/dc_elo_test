"use client"

import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table"
import type { Player } from "@/types/player"

export function LeaderboardSection({
  players,
  loading,
  error,
  onSelect
}: {
  players: Player[]
  loading?: boolean
  error?: string | null
  onSelect: (p: Player) => void
}) {
  return (
    <>
      {error ? (
        <div className="rounded-3xl border p-4 glass card-edge text-sm">
          <div className="font-semibold">Nepodařilo se načíst leaderboard</div>
          <div className="text-muted-foreground mt-1">{error}</div>
        </div>
      ) : loading ? (
        <div className="rounded-3xl border p-4 glass card-edge text-sm text-muted-foreground">
          Načítám leaderboard z Google Sheets…
        </div>
      ) : (
        <LeaderboardTable players={players} onSelect={onSelect} />
      )}
    </>
  )
}
