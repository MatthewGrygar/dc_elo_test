"use client"

import * as React from "react"
import type { Player } from "@/types/player"
import { useRating } from "@/components/providers/rating-provider"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, TrendingUp } from "lucide-react"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts"
import { charts } from "@/data/mockCharts"

function fmt(n: number) {
  return new Intl.NumberFormat("cs-CZ").format(n)
}

function MiniTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-popover px-2.5 py-1.5 text-xs shadow-md">
      {payload[0].value}
    </div>
  )
}

export function PlayerPanel({ player, onBack }: { player: Player; onBack: () => void }) {
  const { mode } = useRating()
  const rating = mode === "elo" ? player.elo : player.dcpr

  return (
    <Card className="glass card-edge shine rounded-3xl h-full overflow-hidden flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {player.name}
          </CardTitle>
          <CardDescription className="mt-1">
            Detail hráče · přepíná se podle {mode.toUpperCase()}
          </CardDescription>
        </div>

        <Button variant="secondary" onClick={onBack} className="rounded-2xl">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zpět
        </Button>
      </CardHeader>

      <CardContent className="pt-0 flex-1 min-h-0 overflow-hidden">
        <div className="h-full grid grid-cols-12 gap-5 min-h-0">
          <div className="col-span-12 xl:col-span-7 min-h-0">
            <div className="rounded-3xl border border-border/60 bg-background/25 p-4 h-full min-h-0">
              <div className="text-sm font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Statistiky
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat label={`Aktuální ${mode.toUpperCase()}`} value={fmt(rating)} />
                <Stat label="Peak" value={fmt(player.peak)} />
                <Stat label="Games" value={fmt(player.games)} />
                <Stat label="Winrate" value={`${player.winrate.toFixed(1)}%`} />
                <Stat label="Win" value={fmt(player.win)} />
                <Stat label="Loss" value={fmt(player.loss)} />
                <Stat label="Draw" value={fmt(player.draw)} />
                <Stat label="ID" value={player.id} />
              </div>

              <div className="mt-4 rounded-2xl border bg-background/20 p-4">
                <div className="text-sm font-medium mb-3">Mini trend (placeholder)</div>
                <div className="h-[170px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={charts.avgRating.slice(-30)}>
                      <XAxis dataKey="date" hide />
                      <YAxis hide />
                      <Tooltip content={<MiniTooltip />} />
                      <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">Později: skutečný rating history pro hráče</div>
              </div>
            </div>
          </div>

          <div className="col-span-12 xl:col-span-5 min-h-0">
            <div className="h-full grid grid-rows-2 gap-5 min-h-0">
              <CardMini title="Poznámky (placeholder)">
                <div className="text-sm text-muted-foreground">
                  Sem můžeš dát poznámky o hráči, poslední zápasy, nebo odkazy na profil.
                </div>
              </CardMini>

              <CardMini title="Akce (placeholder)">
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" className="rounded-2xl">Follow</Button>
                  <Button variant="outline" className="rounded-2xl">Compare</Button>
                  <Button variant="outline" className="rounded-2xl">Export</Button>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Později: napojení na API / reálné akce.
                </div>
              </CardMini>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CardMini({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass card-edge rounded-3xl p-4 h-full min-h-0 overflow-hidden">
      <div className="text-sm font-semibold mb-2">{title}</div>
      <div className="text-sm">{children}</div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-background/25 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  )
}
