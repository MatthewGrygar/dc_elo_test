"use client"

import { motion } from "framer-motion"
import { Activity, Bell, CalendarDays, ShieldCheck, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const items = [
  { title: "Aktivita", icon: Activity, body: "Placeholder: poslední zápasy / události (napojení později)." },
  { title: "Notifikace", icon: Bell, body: "Placeholder: změny v žebříčku, nové turnaje." },
  { title: "Kalendář", icon: CalendarDays, body: "Placeholder: termíny a zápasy (budoucí integrace)." },
  { title: "Stav systému", icon: ShieldCheck, body: "Placeholder: dostupnost dat a aktualizace sheetu." },
  { title: "Highlights", icon: Sparkles, body: "Placeholder: top streaky, peak records, atd." }
]

export function PlaceholderBlocks() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {items.map((it, idx) => (
        <motion.div
          key={it.title}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45, delay: idx * 0.05 }}
          whileHover={{ y: -4 }}
        >
          <Card className="glass card-edge shine rounded-3xl">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <it.icon className="h-4 w-4" />
                  {it.title}
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">Mini panel</p>
              </div>
              <div className="h-9 w-9 rounded-2xl bg-primary/15 border border-border/60 grid place-items-center">
                <it.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {it.body}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
