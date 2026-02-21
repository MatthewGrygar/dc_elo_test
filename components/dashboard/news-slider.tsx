"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Slide = {
  title: string
  body: string
  image: string
  tag?: string
}

const slides: Slide[] = [
  {
    title: "Aktuality",
    body: "Nová verze dashboardu · elegantní panely · rychlé přepínání módů.",
    image: "news/slide-1.svg",
    tag: "Release"
  },
  {
    title: "Turnaje",
    body: "Placeholder: přidej do sheetu seznam turnajů a zobrazíme je zde.",
    image: "news/slide-2.svg",
    tag: "Events"
  },
  {
    title: "Tip týdne",
    body: "Klikni na hráče v leaderboardu a otevři jeho detail jako samostatný panel.",
    image: "news/slide-3.svg",
    tag: "Tip"
  }
]

export function NewsSlider({ intervalMs = 6500 }: { intervalMs?: number }) {
  const [idx, setIdx] = React.useState(0)

  React.useEffect(() => {
    const t = setInterval(() => setIdx((p) => (p + 1) % slides.length), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])

  const s = slides[idx]

  return (
    <Card className="glass card-edge shine rounded-3xl h-full overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Aktuality</CardTitle>
          <div className="text-[11px] px-2 py-1 rounded-full border border-border/60 bg-background/20 text-muted-foreground">
            {s.tag ?? "News"}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative h-[140px] md:h-[150px] lg:h-[150px] rounded-2xl overflow-hidden border border-border/60 bg-background/10">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.45 }}
              className="absolute inset-0"
            >
              <img
                src={s.image}
                alt={s.title}
                className="absolute inset-0 h-full w-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-sm font-semibold text-white">{s.title}</div>
                <div className="mt-1 text-xs text-white/80 leading-relaxed">{s.body}</div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-3 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={
                "h-1.5 rounded-full transition-all border border-border/60 " +
                (i === idx ? "w-8 bg-primary/70" : "w-3 bg-background/30")
              }
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
