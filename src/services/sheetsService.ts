import axios from 'axios'
import type { DataSource } from '../types/core'
import type { Player } from '../types/player'
import { parseCsv, normalizeHeaderKey } from '../utils/csv'
import { sheetsConfig } from './sheetsConfig'

export type StandingsResult = {
  players: Player[]
  fetchedAt: string
  source: DataSource
}

/**
 * Expected columns (case-insensitive, flexible):
 * - name
 * - elo
 * - games
 * - win / wins
 * - loss / losses
 * - draw / draws
 * - peak
 * - winrate (either "0.57" or "57%")
 */
export async function loadStandings(source: DataSource): Promise<StandingsResult> {
  const url = sheetsConfig.csvUrlBySource[source]

  const res = await axios.get<string>(url, { responseType: 'text' })
  const table = parseCsv(res.data)
  if (!table.length) {
    return { players: [], fetchedAt: new Date().toISOString(), source }
  }

  const header = table[0].map(normalizeHeaderKey)
  const idx = (keyCandidates: string[]) => {
    for (const k of keyCandidates) {
      const i = header.indexOf(k)
      if (i >= 0) return i
    }
    return -1
  }

  const iName = idx(['name', 'player', 'hráč', 'hrac'])
  const iElo = idx(['elo', 'rating'])
  const iGames = idx(['games', 'matches', 'her', 'hry'])
  const iWins = idx(['wins', 'win', 'výhry', 'vyhry'])
  const iLosses = idx(['losses', 'loss', 'prohry', 'prohra'])
  const iDraws = idx(['draws', 'draw', 'remizy', 'remiza'])
  const iPeak = idx(['peak', 'max', 'maximum'])
  const iWinrate = idx(['winrate', 'wr'])

  const toInt = (v: string) => {
    const n = Number(String(v ?? '').replace(/[^0-9.-]/g, ''))
    return Number.isFinite(n) ? Math.trunc(n) : 0
  }

  const toFloat01 = (v: string) => {
    const raw = String(v ?? '').trim()
    if (!raw) return 0
    if (raw.includes('%')) {
      const n = Number(raw.replace('%', '').trim())
      return Number.isFinite(n) ? Math.max(0, Math.min(1, n / 100)) : 0
    }
    const n = Number(raw)
    if (!Number.isFinite(n)) return 0
    // if value seems like 57, treat as percent
    if (n > 1.5) return Math.max(0, Math.min(1, n / 100))
    return Math.max(0, Math.min(1, n))
  }

  const rows = table.slice(1)

  const players: Player[] = rows
    .map((r, idxRow) => {
      const name = iName >= 0 ? (r[iName] ?? '').trim() : ''
      if (!name) return null
      const elo = iElo >= 0 ? toInt(r[iElo]) : 0
      const games = iGames >= 0 ? toInt(r[iGames]) : 0
      const wins = iWins >= 0 ? toInt(r[iWins]) : 0
      const losses = iLosses >= 0 ? toInt(r[iLosses]) : 0
      const draws = iDraws >= 0 ? toInt(r[iDraws]) : 0
      const peak = iPeak >= 0 ? toInt(r[iPeak]) : elo
      const winrate = iWinrate >= 0 ? toFloat01(r[iWinrate]) : games ? wins / games : 0

      return {
        rank: idxRow + 1,
        name,
        elo,
        games,
        wins,
        losses,
        draws,
        peak,
        winrate
      } as Player
    })
    .filter((x): x is Player => Boolean(x))

  // Prefer server-provided rank if it exists; otherwise sort by ELO.
  // If sheet already contains sorted standings, this sort is harmless.
  players.sort((a, b) => b.elo - a.elo)
  players.forEach((p, i) => (p.rank = i + 1))

  return { players, fetchedAt: new Date().toISOString(), source }
}
