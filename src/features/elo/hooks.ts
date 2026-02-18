import { useQuery } from '@tanstack/react-query'
import { fetchCsv, toNumber, buildDeterministicSlugs } from '../../lib/csv'
import { sheetCsvUrl, SHEETS } from './sheets'

export type RatingClass = 'A' | 'B' | 'C' | 'D'

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
  ratingClass?: RatingClass | null
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

function normalizeRatingClass(v: unknown): RatingClass | null {
  const s = String(v ?? '').trim().toUpperCase()
  if (!s) return null
  if (s === 'UNRANKED') return null
  // Sheet stores VT1..VT4
  if (s === 'VT1') return 'A'
  if (s === 'VT2') return 'B'
  if (s === 'VT3') return 'C'
  if (s === 'VT4') return 'D'
  // In case the sheet ever starts storing Class letters directly
  if (s === 'A' || s === 'B' || s === 'C' || s === 'D') return s as RatingClass
  return null
}

function parseStandings(rows: string[][]): StandingsRow[] {
  // Expected columns (0-based):
  // A player, B rating, C games, D win, E loss, F draw, G winrate, H peak, I rating class (VT1..VT4 or unranked)
  const parsed: Omit<StandingsRow, 'slug'>[] = []
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]
    const player = (r?.[0] ?? '').toString().trim()
    if (!player) continue
    parsed.push({
      rank: parsed.length + 1,
      player,
      rating: toNumber(r?.[1]),
      games: toNumber(r?.[2]),
      win: toNumber(r?.[3]),
      loss: toNumber(r?.[4]),
      draw: toNumber(r?.[5]),
      winrate: (r?.[6] ?? '').toString().trim(),
      peak: toNumber(r?.[7]),
      ratingClass: normalizeRatingClass(r?.[8]),
    })
  }

  const slugs = buildDeterministicSlugs(parsed.map((p) => p.player))
  return parsed.map((p, idx) => ({ ...p, slug: slugs[idx] }))
}

export function useStandings(mode: 'elo' | 'dcpr') {
  return useQuery({
    queryKey: ['standings', mode],
    queryFn: async () => {
      const sheet = mode === 'dcpr' ? SHEETS.tournamentElo : SHEETS.eloStandings
      const rows = await fetchCsv(sheetCsvUrl(sheet))
      return parseStandings(rows)
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
