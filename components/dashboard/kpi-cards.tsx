"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Users, Swords, TrendingUp, Crown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { players } from "@/data/mockPlayers"
import { useRating } from "@/components/providers/rating-provider"

function formatNumber(n: number) {
  return new Intl.NumberFormat("cs-CZ").format(n)
}

export function KpiCards() {
  const { mode } = useRating()

  const playerCount = players.length
  const totalGames = players.reduce((a, p) => a + p.games, 0)
  const avg = Math.round(players.reduce((a, p) => a + (mode === "elo" ? p.elo : p.dcpr), 0) / players.length)
  const top = Math.max(...players.map((p) => (mode === "elo" ? p.elo : p.dcpr)))

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
              <div className="text-3xl font-semibold tracking-tight">{it.value}</div>
              <div className="mt-2 text-xs text-muted-foreground">
                Placeholder data · připraveno pro napojení API
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
