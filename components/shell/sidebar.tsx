"use client"

import { LayoutDashboard, Trophy, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type ViewKey = "dashboard" | "leaderboard" | "stats" | "player"

const items: Array<{ key: ViewKey; label: string; icon: any }> = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "stats", label: "Statistics", icon: BarChart3 },
  { key: "leaderboard", label: "Leaderboard", icon: Trophy }
]

export function Sidebar({ view, setView }: { view: ViewKey; setView: (v: ViewKey) => void }) {
  return (
    <aside className="h-full w-[76px] lg:w-[260px] p-3">
      <div className="glass card-edge rounded-3xl h-full flex flex-col">
        <div className="p-3 lg:p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/15 border border-border/60 grid place-items-center">
            <span className="text-xs font-bold">DC</span>
          </div>
          <div className="hidden lg:block leading-tight">
            <div className="text-sm font-semibold">DC ELO</div>
            <div className="text-[11px] text-muted-foreground -mt-0.5">rating dashboard</div>
          </div>
        </div>

        <nav className="px-2 lg:px-3 pb-3 space-y-1">
          {items.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={view === key ? "secondary" : "ghost"}
              onClick={() => setView(key)}
              className={cn(
                "w-full justify-start gap-2 rounded-2xl",
                "h-11",
                view === key ? "bg-secondary/70" : "hover:bg-muted/40"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden lg:inline">{label}</span>
            </Button>
          ))}
        </nav>

        <div className="mt-auto p-3 lg:p-4">
          <div className="hidden lg:block rounded-2xl border border-border/60 bg-background/20 p-4 text-sm">
            <div className="font-medium">Tip</div>
            <div className="mt-1 text-muted-foreground text-xs">
              Přepni ELO/DCPR a uvidíš data z Google Sheets.
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
