"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { RatingPill } from "@/components/shell/rating-pill"
import { ThemeToggle } from "@/components/shell/theme-toggle"
import { useRating } from "@/components/providers/rating-provider"

export function Topbar({
  query,
  setQuery
}: {
  query: string
  setQuery: (v: string) => void
}) {
  const { mode, setMode } = useRating()

  return (
    <header className="h-16 px-4 flex items-center gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search players…"
          className="pl-9"
        />
      </div>

      <div className="flex items-center gap-3">
        <RatingPill mode={mode} setMode={setMode} />
        <ThemeToggle />
      </div>
    </header>
  )
}
