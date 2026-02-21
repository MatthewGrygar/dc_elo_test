"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <div className="flex items-center gap-2">
      <Sun className={cn("h-4 w-4", isDark ? "opacity-50" : "opacity-100")} />
      <Switch
        checked={isDark}
        onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
        aria-label="Toggle theme"
      />
      <Moon className={cn("h-4 w-4", isDark ? "opacity-100" : "opacity-50")} />
    </div>
  )
}
