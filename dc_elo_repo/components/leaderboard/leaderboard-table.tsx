"use client"

import * as React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Player } from "@/types/player"
import { cn } from "@/lib/utils"
import { useRating } from "@/components/providers/rating-provider"

function fmt(n: number) {
  return new Intl.NumberFormat("cs-CZ").format(n)
}

export function LeaderboardTable({
  players,
  onSelect
}: {
  players: Player[]
  onSelect: (p: Player) => void
}) {
  const { mode } = useRating()

  return (
    <div className={cn("rounded-3xl border overflow-hidden", "glass dark:glass")}>
      <div className="overflow-x-auto">
        <Table className="min-w-[980px]">
          <TableHeader className="sticky top-0 bg-background/70 backdrop-blur-md">
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Hráč</TableHead>
              <TableHead>{mode.toUpperCase()}</TableHead>
              <TableHead>Games</TableHead>
              <TableHead>Win</TableHead>
              <TableHead>Loss</TableHead>
              <TableHead>Draw</TableHead>
              <TableHead>Peak</TableHead>
              <TableHead>Winrate</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {players.map((p, idx) => {
              const rating = mode === "elo" ? p.elo : p.dcpr
              return (
                <TableRow
                  key={p.id}
                  onClick={() => onSelect(p)}
                  className="cursor-pointer hover:bg-muted/40 transition-colors"
                >
                  <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="font-semibold">{fmt(rating)}</TableCell>
                  <TableCell>{fmt(p.games)}</TableCell>
                  <TableCell>{fmt(p.win)}</TableCell>
                  <TableCell>{fmt(p.loss)}</TableCell>
                  <TableCell>{fmt(p.draw)}</TableCell>
                  <TableCell>{fmt(p.peak)}</TableCell>
                  <TableCell>{p.winrate.toFixed(1)}%</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      <div className="px-4 py-3 text-xs text-muted-foreground border-t bg-background/30">
        Tip: na mobilu se tabulka horizontálně posouvá · sticky header zapnutý
      </div>
    </div>
  )
}
