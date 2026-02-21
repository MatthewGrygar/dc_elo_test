"use client"

import * as React from "react"
import type { Player } from "@/types/player"
import { parseCsv, sheetCsvUrl, toNumber, type RatingMode } from "@/lib/google-sheets"

// Sheet names in the provided spreadsheet.
const SHEETS: Record<RatingMode, string> = {
  elo: "Elo standings",
  // If you later add a dedicated DCPR tab, set it here.
  // Until then, we fall back to Elo standings.
  dcpr: "Elo standings"
}

function rowsToPlayers(rows: string[][], mode: RatingMode): Player[] {
  if (!rows.length) return []
  const dataRows = rows.slice(1).filter((r) => (r?.[0] ?? "").trim().length > 0)

  return dataRows.map((r, idx) => {
    const name = (r[0] ?? "").trim()
    const rating = toNumber(r[1])
    const games = toNumber(r[2])
    const win = toNumber(r[3])
    const loss = toNumber(r[4])
    const draw = toNumber(r[5])
    const winrate = toNumber(r[6])
    const peak = toNumber(r[7])

    // Store both, so the UI can switch modes.
    // Once you provide a separate DCPR sheet, map its rating to dcpr instead.
    const elo = rating
    const dcpr = rating

    return {
      id: `${idx}-${name}`,
      name,
      elo,
      dcpr,
      games,
      win,
      loss,
      draw,
      peak,
      winrate
    }
  })
}

export function useStandings(mode: RatingMode) {
  const [players, setPlayers] = React.useState<Player[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function run() {
      setLoading(true)
      setError(null)
      try {
        const url = sheetCsvUrl(SHEETS[mode])
        const res = await fetch(url, { signal: controller.signal, cache: "no-store" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const text = await res.text()
        const rows = parseCsv(text)
        const parsed = rowsToPlayers(rows, mode)
        if (!cancelled) setPlayers(parsed)
      } catch (e: any) {
        if (e?.name === "AbortError") return
        if (!cancelled) {
          setError(e?.message ?? "Failed to load data")
          setPlayers([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [mode])

  return { players, loading, error }
}
