"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { slides } from "@/data/mockSlides"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function HeroSlider() {
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    const t = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), 6500)
    return () => window.clearInterval(t)
  }, [])

  const slide = slides[index]

  return (
    <section className={cn("rounded-3xl overflow-hidden border", "glass dark:glass", "relative")}>
      <div className="absolute inset-0 pointer-events-none opacity-80 dark:opacity-70 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
      <div className="relative p-6 md:p-10 min-h-[180px] flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="max-w-2xl space-y-3"
          >
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/40 dark:bg-background/25 backdrop-blur-md px-3 py-1 text-xs text-muted-foreground">
              Auto-rotating showcase
              <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
              {index + 1}/{slides.length}
            </div>

            <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">{slide.title}</h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{slide.text}</p>

            <div className="pt-2">
              <Button variant="secondary" className="rounded-xl gap-2">
                {slide.cta}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-6 pb-5 md:px-10 md:pb-7 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={cn(
              "h-2 rounded-full transition-all border",
              i === index ? "w-8 bg-primary/30 border-border" : "w-3 bg-muted/40 border-border/60"
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
