"use client"

import * as React from "react"

export type RatingMode = "elo" | "dcpr"

type RatingContextValue = {
  mode: RatingMode
  setMode: (m: RatingMode) => void
}

const RatingContext = React.createContext<RatingContextValue | null>(null)

export function RatingProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<RatingMode>("elo")
  const value = React.useMemo(() => ({ mode, setMode }), [mode])

  return <RatingContext.Provider value={value}>{children}</RatingContext.Provider>
}

export function useRating() {
  const ctx = React.useContext(RatingContext)
  if (!ctx) throw new Error("useRating must be used within RatingProvider")
  return ctx
}
