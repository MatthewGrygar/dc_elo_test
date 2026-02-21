"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Users, Swords, TrendingUp, Crown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useRating } from "@/components/providers/rating-provider"
import type { Player } from "@/types/player"

function formatNumber(n: number) {
  return new Intl.NumberFormat("cs-CZ").format(n)
}

export function KpiCards({ players, loading }: { players: Player[]; loading?: boolean }) {
  const { mode } = useRating()

  const safePlayers = players ?? []
  const playerCount = safePlayers.length
  const totalGames = safePlayers.reduce((a, p) => a + p.games, 0)
  const avg =
    playerCount > 0
      ? Math.round(safePlayers.reduce((a, p) => a + (mode === "elo" ? p.elo : p.dcpr), 0) / playerCount)
      : 0
  const top = playerCount > 0 ? Math.max(...safePlayers.map((p) => (mode === "elo" ? p.elo : p.dcpr))) : 0

  const items = [
    { title: "Počet hráčů", value: formatNumber(playerCount), icon: Users, hint: "Aktivní hráči v datasetu" },
    { title: "Počet her", value: formatNumber(totalGames), icon: Swords, hint: "Součet odehraných her" },
    { title: `Průměrné ${mode.toUpperCase()}`, value: formatNumber(avg), icon: TrendingUp, hint: "Průměrná hodnota ratingu" },
    { title: `Top ${mode.toUpperCase()}`, value: formatNumber(top), icon: Crown, hint: "Nejvyšší aktuální rating" }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {items.map((it, idx) => (
        <motion.div
          key={it.title}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45, delay: idx * 0.06 }}
          whileHover={{ y: -4 }}
        >
          <Card className={cn("glass dark:glass rounded-3xl")}>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle>{it.title}</CardTitle>
                <CardDescription>{it.hint}</CardDescription>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-primary/15 border border-border/60 grid place-items-center">
                <it.icon className="h-5 w-5" />
              </div>
            </CardHeader>

            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">
                {loading ? <span className="inline-block h-8 w-24 rounded-md bg-muted/40 animate-pulse" /> : it.value}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {loading ? "Načítám data z Google Sheets…" : "Data: veřejný Google Sheet"}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
