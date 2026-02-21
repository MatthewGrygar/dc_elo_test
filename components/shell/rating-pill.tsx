"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function RatingPill({
  mode,
  setMode
}: {
  mode: "elo" | "dcpr"
  setMode: (m: "elo" | "dcpr") => void
}) {
  return (
    <div className="relative flex items-center rounded-full border bg-background/40 dark:bg-background/25 backdrop-blur-md p-1 shadow-sm">
      <PillItem active={mode === "elo"} onClick={() => setMode("elo")}>
        ELO
      </PillItem>
      <PillItem active={mode === "dcpr"} onClick={() => setMode("dcpr")}>
        DCPR
      </PillItem>

      <motion.div
        layout
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
        className={cn(
          "absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full",
          "bg-primary/20 border border-border/60"
        )}
        style={{ left: mode === "elo" ? 4 : "calc(50% + 2px)" }}
      />
    </div>
  )
}

function PillItem({
  active,
  onClick,
  children
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative z-10 h-8 px-4 rounded-full text-sm font-medium transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}
