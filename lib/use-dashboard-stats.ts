"use client"

import * as React from "react"
import { parseCsv, sheetCsvUrl, toNumber, type RatingMode } from "@/lib/google-sheets"

// Sources per mode (provided by user).
const PLAYER_CARDS_SHEETS: Record<RatingMode, string> = {
  elo: "Player cards (CSV)",
  dcpr: "Player cards (CSV) - Tournament",
}

// Tournament list lives in the "Data" sheet.
const TOURNAMENTS_SHEET = "Data"

export type DashboardStats = {
  totalGames: number
  uniquePlayers: number
  activePlayers30d: number
  games30d: number
  newPlayers30d: number
  medianRating: number
  uniqueTournaments: number
  avgAbsChange: number
}

function parseDateLoose(v: string): Date | null {
  const s = (v ?? "").trim()
  if (!s) return null

  // Try native parsing first (ISO / RFC).
  const t = Date.parse(s)
  if (!Number.isNaN(t)) return new Date(t)

  // dd.mm.yyyy
  let m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (m) {
    const dd = Number(m[1])
    const mm = Number(m[2])
    const yyyy = Number(m[3])
    const d = new Date(Date.UTC(yyyy, mm - 1, dd))
    return Number.isFinite(d.getTime()) ? d : null
  }

  // dd/mm/yyyy
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (m) {
    const dd = Number(m[1])
    const mm = Number(m[2])
    const yyyy = Number(m[3])
    const d = new Date(Date.UTC(yyyy, mm - 1, dd))
    return Number.isFinite(d.getTime()) ? d : null
  }

  return null
}

function median(values: number[]): number {
  const xs = values.filter((n) => Number.isFinite(n)).sort((a, b) => a - b)
  if (!xs.length) return 0
  const mid = Math.floor(xs.length / 2)
  if (xs.length % 2 === 0) return (xs[mid - 1] + xs[mid]) / 2
  return xs[mid]
}

export function useDashboardStats(mode: RatingMode, ratings: number[]) {
  const [stats, setStats] = React.useState<DashboardStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function run() {
      setLoading(true)
      setError(null)

      try {
        const [playerCardsRes, tournamentsRes] = await Promise.all([
          fetch(sheetCsvUrl(PLAYER_CARDS_SHEETS[mode]), { signal: controller.signal, cache: "no-store" }),
          fetch(sheetCsvUrl(TOURNAMENTS_SHEET), { signal: controller.signal, cache: "no-store" }),
        ])

        if (!playerCardsRes.ok) throw new Error(`Player cards HTTP ${playerCardsRes.status}`)
        if (!tournamentsRes.ok) throw new Error(`Data HTTP ${tournamentsRes.status}`)

        const [playerCardsCsv, tournamentsCsv] = await Promise.all([
          playerCardsRes.text(),
          tournamentsRes.text(),
        ])

        const pcRows = parseCsv(playerCardsCsv)
        const dataRows = parseCsv(tournamentsCsv)

        // Player cards columns (0-based indices):
        // A = name, B = game id, E = date (for active players), H = ELO change, J = date (for games last 30d)
        const dataPc = pcRows.slice(1)

        const nameSet = new Set<string>()
        const gameSet = new Set<string>()
        const activeNameSet = new Set<string>()
        const games30Set = new Set<string>()
        const firstSeenByName = new Map<string, number>()
        const absChanges: number[] = []

        const now = new Date()
        const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        for (const r of dataPc) {
          const name = (r?.[0] ?? "").trim()
          if (name) nameSet.add(name)

          const gameId = (r?.[1] ?? "").trim()
          if (gameId) gameSet.add(gameId)

          const dActive = parseDateLoose(r?.[4] ?? "")
          if (name && dActive && dActive >= cutoff) activeNameSet.add(name)

          const dGame = parseDateLoose(r?.[9] ?? "")
          if (gameId && dGame && dGame >= cutoff) games30Set.add(gameId)

          // New players in last 30 days: take the first ever "activity" date per player.
          const firstDate = dActive ?? dGame
          if (name && firstDate) {
            const ts = firstDate.getTime()
            const prev = firstSeenByName.get(name)
            if (prev == null || ts < prev) firstSeenByName.set(name, ts)
          }

          const change = toNumber(r?.[7] ?? "")
          if (change !== 0) absChanges.push(Math.abs(change))
        }

        const newPlayers30d = Array.from(firstSeenByName.values()).filter((ts) => ts >= cutoff.getTime()).length

        // Tournaments: count non-empty values in column B from row 3 (1-based).
        const dataT = dataRows.slice(2) // skip first two rows => start at row 3
        const tournamentCount = dataT.filter((r) => (r?.[1] ?? "").trim().length > 0).length

        const computed: DashboardStats = {
          totalGames: gameSet.size,
          uniquePlayers: nameSet.size,
          activePlayers30d: activeNameSet.size,
          games30d: games30Set.size,
          newPlayers30d,
          medianRating: Math.round(median(ratings)),
          uniqueTournaments: tournamentCount,
          avgAbsChange: absChanges.length ? Number((absChanges.reduce((a, b) => a + b, 0) / absChanges.length).toFixed(1)) : 0,
        }

        if (!cancelled) setStats(computed)
      } catch (e: any) {
        if (e?.name === "AbortError") return
        if (!cancelled) {
          setError(e?.message ?? "Failed to load dashboard stats")
          setStats(null)
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
  }, [mode, ratings])

  return { stats, loading, error }
}
