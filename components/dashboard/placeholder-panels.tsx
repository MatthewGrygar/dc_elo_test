"use client"

import { motion } from "framer-motion"
import { Activity, Bell, CalendarDays, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type PlaceholderItem = {
  title: string
  icon: LucideIcon
  body: string
  meta?: string
}

export const placeholderItems: PlaceholderItem[] = [
  {
    title: "Aktivita",
    icon: Activity,
    body: "Placeholder: poslední zápasy / události (napojení později).",
    meta: "Live feed"
  },
  {
    title: "Notifikace",
    icon: Bell,
    body: "Placeholder: změny v žebříčku, nové turnaje.",
    meta: "Alerts"
  },
  {
    title: "Kalendář",
    icon: CalendarDays,
    body: "Placeholder: termíny a zápasy (budoucí integrace).",
    meta: "Schedule"
  },
  {
    title: "Stav systému",
    icon: ShieldCheck,
    body: "Placeholder: dostupnost dat a aktualizace sheetu.",
    meta: "Health"
  },
  {
    title: "Highlights",
    icon: Sparkles,
    body: "Placeholder: streaky, peak records, top movers.",
    meta: "Insights"
  }
]

export function PlaceholderPanel({ item }: { item: PlaceholderItem }) {
  const Icon = item.icon
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
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {item.title}
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">{item.meta ?? "Panel"}</p>
          </div>
          <div className="h-9 w-9 rounded-2xl bg-primary/15 border border-border/60 grid place-items-center">
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{item.body}</CardContent>
      </Card>
    </motion.div>
  )
}
