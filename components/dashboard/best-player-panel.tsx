"use client"

import { motion } from "framer-motion"
import { Crown, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Player } from "@/types/player"
import type { RatingMode } from "@/lib/google-sheets"

export function BestPlayerPanel({ player, mode }: { player: Player | null; mode: RatingMode }) {
  const rating = player ? (mode === "elo" ? player.elo : player.dcpr) : 0
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="glass card-edge shine rounded-3xl h-full">
        <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Nejlepší hráč
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">aktuální #1 podle {mode === "elo" ? "ELO" : "DCPR"}</p>
          </div>
          <div className="h-9 w-9 rounded-2xl bg-primary/15 border border-border/60 grid place-items-center">
            <TrendingUp className="h-4 w-4" />
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          {player ? (
            <>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-xl font-semibold tracking-tight">{player.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Games: {player.games} · Winrate: {Math.round(player.winrate)}%</div>
                </div>
                <div className="text-3xl font-semibold tracking-tight tabular-nums">{Intl.NumberFormat("cs-CZ").format(rating)}</div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">Peak: {Intl.NumberFormat("cs-CZ").format(player.peak)}</div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">Načítám…</div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
