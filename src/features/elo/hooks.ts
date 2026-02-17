import { useQuery } from '@tanstack/react-query'
import { fetchCsv, toNumber, normalizeKey, buildDeterministicSlugs } from '../../lib/csv'
import { sheetCsvUrl, SHEETS } from './sheets'

export type StandingsRow = {
  rank: number
  player: string
  slug: string
  rating: number
  games: number
  win: number
  loss: number
  draw: number
  peak: number
  winrate: string
  vt?: string | null
}

export type PlayerCard = {
  player: string
  matchId: number
  tournament: string
  tournamentDetail: string
  date: string
  opponent: string
  result: string
  delta: string
  elo: number
}

export type PlayerSummary = {
  player: string
  avgOpp: number
  winStreak: number
  lossStreak: number
}

function normalizeVT(v: unknown) {
  const s = String(v ?? '').trim().toUpperCase()
  if (!s) return null
  if (s.startsWith('VT')) return s
  return s
}

export function useVtMap() {
  return useQuery({
    queryKey: ['vtMap'],
    queryFn: async () => {
      const rows = await fetchCsv(sheetCsvUrl(SHEETS.tournamentElo))
      const map = new Map<string, string | null>()
      for (let i = 1; i < rows.length; i++) {
        const player = (rows[i]?.[0] ?? '').toString().trim()
        if (!player) continue
        const vt = normalizeVT(rows[i]?.[8])
        map.set(normalizeKey(player), vt)
      }
      return map
    },
  })
}

function parseStandings(rows: string[][], vtMap: Map<string, string | null>): StandingsRow[] {
  // Columns (0-based) from original app:
  // A player, B rating, C games, D win, E loss, F draw, G peak, H winrate
  const parsed: Omit<StandingsRow, 'slug'>[] = []
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]
    const player = (r?.[0] ?? '').toString().trim()
    if (!player) continue
    parsed.push({
      rank: i,
      player,
      rating: toNumber(r?.[1]),
      games: toNumber(r?.[2]),
      win: toNumber(r?.[3]),
      loss: toNumber(r?.[4]),
      draw: toNumber(r?.[5]),
      peak: toNumber(r?.[6]),
      winrate: (r?.[7] ?? '').toString().trim(),
      vt: vtMap.get(normalizeKey(player)) ?? null,
    })
  }

  // Slugs based on canonical order
  const slugs = buildDeterministicSlugs(parsed.map((p) => p.player))
  return parsed.map((p, idx) => ({ ...p, slug: slugs[idx] }))
}

export function useStandings(mode: 'elo' | 'dcpr') {
  const vt = useVtMap()

  return useQuery({
    queryKey: ['standings', mode, vt.data ? 'vt' : 'no-vt'],
    enabled: vt.isSuccess,
    queryFn: async () => {
      const sheet = mode === 'dcpr' ? SHEETS.tournamentElo : SHEETS.eloStandings
      const rows = await fetchCsv(sheetCsvUrl(sheet))
      return parseStandings(rows, vt.data ?? new Map())
    },
  })
}

export function useLastTournamentLabel() {
  return useQuery({
    queryKey: ['lastTournament'],
    queryFn: async () => {
      const rows = await fetchCsv(sheetCsvUrl(SHEETS.data))
      let last = ''
      for (let i = 1; i < rows.length; i++) {
        const v = (rows[i]?.[1] ?? '').toString().trim()
        if (v) last = v
      }
      return last
    },
  })
}

export function usePlayerCards(mode: 'elo' | 'dcpr') {
  return useQuery({
    queryKey: ['playerCards', mode],
    queryFn: async () => {
      const sheet = mode === 'dcpr' ? SHEETS.playerCardsTournament : SHEETS.playerCards
      const rows = await fetchCsv(sheetCsvUrl(sheet))
      const items: PlayerCard[] = []
      for (let i = 1; i < rows.length; i++) {
        const r = rows[i]
        const player = (r?.[0] ?? '').toString().trim()
        if (!player) continue
        items.push({
          player,
          matchId: toNumber(r?.[1]),
          tournament: (r?.[2] ?? '').toString().trim(),
          tournamentDetail: (r?.[3] ?? '').toString().trim(),
          date: (r?.[4] ?? '').toString().trim(),
          opponent: (r?.[5] ?? '').toString().trim(),
          result: (r?.[6] ?? '').toString().trim(),
          delta: (r?.[7] ?? '').toString().trim(),
          elo: toNumber(r?.[8]),
        })
      }
      return items
    },
  })
}

export function usePlayerSummary(mode: 'elo' | 'dcpr') {
  return useQuery({
    queryKey: ['playerSummary', mode],
    queryFn: async () => {
      const sheet = mode === 'dcpr' ? SHEETS.playerSummaryTournament : SHEETS.playerSummary
      const rows = await fetchCsv(sheetCsvUrl(sheet))
      const items: PlayerSummary[] = []
      for (let i = 1; i < rows.length; i++) {
        const r = rows[i]
        const player = (r?.[0] ?? '').toString().trim()
        if (!player) continue
        items.push({
          player,
          avgOpp: toNumber(r?.[12]),
          winStreak: toNumber(r?.[13]),
          lossStreak: toNumber(r?.[14]),
        })
      }
      return items
    },
  })
}
