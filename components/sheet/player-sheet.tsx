"use client"

import * as React from "react"
import type { Player } from "@/types/player"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useRating } from "@/components/providers/rating-provider"
import { User, TrendingUp } from "lucide-react"
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

export function PlayerSheet({ player, onClose }: { player: Player | null; onClose: () => void }) {
  const open = !!player
  const { mode } = useRating()

  const rating = player ? (mode === "elo" ? player.elo : player.dcpr) : 0
  const peak = player?.peak ?? 0

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right">
        {player ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-primary/15 border border-border/60 grid place-items-center">
                <User className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-semibold leading-tight">{player.name}</div>
                <div className="text-xs text-muted-foreground">ID: {player.id}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Stat label={`Aktuální ${mode.toUpperCase()}`} value={fmt(rating)} icon={<TrendingUp className="h-4 w-4" />} />
              <Stat label="Peak" value={fmt(peak)} />
              <Stat label="Games" value={fmt(player.games)} />
              <Stat label="Winrate" value={`${player.winrate.toFixed(1)}%`} />
              <Stat label="Win" value={fmt(player.win)} />
              <Stat label="Loss" value={fmt(player.loss)} />
              <Stat label="Draw" value={fmt(player.draw)} />
              <Stat label="—" value="Mock panel" />
            </div>

            <div className="rounded-2xl border bg-background/30 p-4">
              <div className="text-sm font-medium mb-3">Mini trend (placeholder)</div>
              <div className="h-[150px]">
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
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-background/30 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">{label}</div>
        {icon ? <div className="text-muted-foreground">{icon}</div> : null}
      </div>
      <div className="mt-1 text-base font-semibold">{value}</div>
    </div>
  )
}
