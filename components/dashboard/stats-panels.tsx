"use client"

import { motion } from "framer-motion"
import {
  Users,
  Gamepad2,
  CalendarClock,
  TrendingUp,
  UserPlus,
  Sigma,
  Trophy,
  Gauge,
  type LucideIcon,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardStats } from "@/lib/use-dashboard-stats"

type StatItem = {
  key: keyof DashboardStats
  title: string
  icon: LucideIcon
  format?: (v: any) => string
  meta: string
}

const items: StatItem[] = [
  { key: "totalGames", title: "Celkový počet her", icon: Gamepad2, meta: "unikátní game ID" },
  { key: "uniquePlayers", title: "Unikátní hráči", icon: Users, meta: "podle Player cards" },
  { key: "activePlayers30d", title: "Aktivní hráči", icon: CalendarClock, meta: "posledních 30 dní" },
  { key: "games30d", title: "Hry", icon: TrendingUp, meta: "posledních 30 dní" },
  { key: "newPlayers30d", title: "Noví hráči", icon: UserPlus, meta: "posledních 30 dní" },
  { key: "medianRating", title: "Medián ratingu", icon: Sigma, meta: "ze standings" },
  { key: "uniqueTournaments", title: "Turnaje", icon: Trophy, meta: "Data!B3:B" },
  {
    key: "avgAbsChange",
    title: "Prům. změna ratingu",
    icon: Gauge,
    meta: "AVG(ABS(H))",
    format: (v) => `${v}`,
  },
]

function StatPanel({ title, icon: Icon, value, meta }: { title: string; icon: LucideIcon; value: string; meta: string }) {
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
              <Icon className="h-4 w-4" />
              {title}
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">{meta}</p>
          </div>
          <div className="h-9 w-9 rounded-2xl bg-primary/15 border border-border/60 grid place-items-center">
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="text-3xl font-semibold tracking-tight">{value}</div>
          <div className="mt-2 text-xs text-muted-foreground">Aktualizováno z Google Sheets</div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function DashboardStatPanels({
  stats,
  loading,
  range,
}: {
  stats: DashboardStats | null
  loading: boolean
  range?: [number, number]
}) {
  const [from, to] = range ?? [0, items.length]
  const slice = items.slice(from, to)

  return (
    <>
      {slice.map((it) => {
        const raw = stats ? (stats as any)[it.key] : 0
        const value = loading ? "…" : it.format ? it.format(raw) : Intl.NumberFormat("cs-CZ").format(raw)
        return <StatPanel key={it.key} title={it.title} icon={it.icon} value={value} meta={it.meta} />
      })}
    </>
  )
}
