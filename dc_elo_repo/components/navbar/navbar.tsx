"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { Moon, Sun, Trophy, BarChart3, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useRating } from "@/components/providers/rating-provider"

const navItems = [
  { id: "statistics", label: "Statistics", icon: BarChart3 },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy }
] as const

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const { mode, setMode } = useRating()
  const [active, setActive] = React.useState<string>("dashboard")

  React.useEffect(() => {
    const handler = () => {
      const sections = ["dashboard", "statistics", "leaderboard"]
      let current = "dashboard"
      for (const id of sections) {
        const el = document.getElementById(id)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if (rect.top <= 120) current = id
      }
      setActive(current)
    }
    handler()
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const isDark = theme === "dark"

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b",
        "bg-background/50 dark:bg-background/35 backdrop-blur-md shadow-sm"
      )}
    >
      <div className="container h-16 flex items-center gap-3">
        {/* Center-left: nav buttons */}
        <nav className="flex-1 flex items-center justify-center md:justify-start gap-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={active === id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => scrollTo(id)}
              className="gap-2 rounded-xl"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Button>
          ))}
        </nav>

        {/* Center-right: segmented + theme */}
        <div className="flex items-center gap-3">
          <SegmentedPill mode={mode} setMode={setMode} />
          <div className="flex items-center gap-2 pl-1">
            <Sun className={cn("h-4 w-4", isDark ? "opacity-50" : "opacity-100")} />
            <Switch
              checked={isDark}
              onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
              aria-label="Toggle theme"
            />
            <Moon className={cn("h-4 w-4", isDark ? "opacity-100" : "opacity-50")} />
          </div>

          {/* Right: brand */}
          <div className="flex items-center gap-2 pl-2">
            <div className="h-8 w-8 rounded-xl bg-primary/15 border border-border/60 grid place-items-center">
              <span className="text-xs font-bold">DC</span>
            </div>
            <div className="leading-tight hidden md:block">
              <div className="text-sm font-semibold">DC ELO</div>
              <div className="text-[11px] text-muted-foreground -mt-0.5">rating dashboard</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

function SegmentedPill({
  mode,
  setMode
}: {
  mode: "elo" | "dcpr"
  setMode: (m: "elo" | "dcpr") => void
}) {
  return (
    <div className="relative flex items-center rounded-full border bg-background/40 dark:bg-background/30 backdrop-blur-md p-1 shadow-sm">
      <PillItem active={mode === "elo"} onClick={() => setMode("elo")}>
        ELO
      </PillItem>
      <PillItem active={mode === "dcpr"} onClick={() => setMode("dcpr")}>
        DCPR
      </PillItem>

      <motion.div
        layout
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className={cn(
          "absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-primary/20 border border-border/60 shadow-soft"
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
