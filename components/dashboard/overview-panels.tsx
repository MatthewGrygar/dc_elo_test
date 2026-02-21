"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Trophy, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Player } from "@/types/player"
import { useRating } from "@/components/providers/rating-provider"

function formatNumber(n: number) {
  return new Intl.NumberFormat("cs-CZ").format(n)
}

export function OverviewPanels({ players }: { players: Player[] }) {
  const { mode } = useRating()

  const safePlayers = players ?? []
  const topPlayer = React.useMemo(() => {
    const sorted = [...safePlayers].sort((a, b) => (mode === "elo" ? b.elo - a.elo : b.dcpr - a.dcpr))
    return sorted[0]
  }, [safePlayers, mode])

  const avg =
    safePlayers.length > 0
      ? Math.round(safePlayers.reduce((a, p) => a + (mode === "elo" ? p.elo : p.dcpr), 0) / safePlayers.length)
      : 0

  return (
    <div className="grid grid-cols-12 gap-5">
      {/* Left */}
      <motion.div
        className="col-span-12 lg:col-span-4"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glass card-edge shine rounded-3xl">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Přehled
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Rychlé info z veřejného Google Sheetu.
              </p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-primary/15 border border-border/60 grid place-items-center">
              <Info className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Průměr</span>
              <span className="text-2xl font-semibold tracking-tight">{formatNumber(avg)}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Režim</span>
              <span className="text-sm font-medium uppercase">{mode}</span>
            </div>
            <div className="pt-2">
              <Button variant="secondary" className="w-full rounded-2xl">
                Open sheet
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Center (hero panel) */}
      <motion.div
        className="col-span-12 lg:col-span-5"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55, delay: 0.05 }}
      >
        <Card className="glass card-edge rounded-3xl overflow-hidden">
          <div className="relative">
            <motion.div
              aria-hidden="true"
              className="absolute -top-10 -right-10 h-72 w-72 rounded-full bg-primary/20 blur-2xl"
              animate={{ scale: [1, 1.08, 1], rotate: [0, 8, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden="true"
              className="absolute -bottom-16 left-10 h-64 w-64 rounded-full bg-chart-2/20 blur-2xl"
              animate={{ scale: [1, 1.06, 1], rotate: [0, -6, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            <CardHeader className="relative">
              <CardTitle className="text-lg">Top hráč</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Aktuálně nejlepší výkon v režimu {mode.toUpperCase()}.
              </p>
            </CardHeader>

            <CardContent className="relative pb-8">
              {topPlayer ? (
                <div className="flex items-end justify-between gap-6">
                  <div>
                    <div className="text-3xl font-semibold tracking-tight">{topPlayer.name}</div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Games: <span className="text-foreground">{formatNumber(topPlayer.games)}</span> • Peak:{" "}
                      <span className="text-foreground">{formatNumber(topPlayer.peak)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Rating</div>
                    <div className="text-4xl font-semibold tracking-tight">
                      {formatNumber(mode === "elo" ? topPlayer.elo : topPlayer.dcpr)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-20 w-full rounded-2xl bg-muted/30 animate-pulse" />
              )}
            </CardContent>
          </div>
        </Card>
      </motion.div>

      {/* Right */}
      <motion.div
        className="col-span-12 lg:col-span-3"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="glass card-edge shine rounded-3xl">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Tip
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Klikni na hráče v tabulce pro detail.
              </p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-primary/15 border border-border/60 grid place-items-center">
              <Trophy className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-border/60 bg-background/20 p-4">
              <div className="text-sm font-medium">Mód přepíná celý dashboard</div>
              <div className="mt-1 text-sm text-muted-foreground">
                ELO / DCPR mění žebříček i statistiky.
              </div>
            </div>
            <Button className="w-full rounded-2xl">Let&apos;s go</Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
