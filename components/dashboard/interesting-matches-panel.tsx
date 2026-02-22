"use client"

import { motion } from "framer-motion"
import { Flame } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardStats } from "@/lib/use-dashboard-stats"

export function InterestingMatchesPanel({ stats }: { stats: DashboardStats | null }) {
  const matches = stats?.interestingMatches ?? []

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
              <Flame className="h-4 w-4" />
              Zajímavé zápasy
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">posledních 30 dní · top dle změny ratingu</p>
          </div>
          <div className="h-9 w-9 rounded-2xl bg-primary/15 border border-border/60 grid place-items-center">
            <Flame className="h-4 w-4" />
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="space-y-2">
            {matches.length ? (
              matches.slice(0, 6).map((m) => (
                <div key={m.gameId} className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/35 px-3 py-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{m.players.join(" vs ")}</div>
                    <div className="text-[11px] text-muted-foreground">{m.date || "—"} · ID: {m.gameId}</div>
                  </div>
                  <div className="text-sm font-semibold tabular-nums">±{m.totalAbsChange}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">Načítám…</div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
