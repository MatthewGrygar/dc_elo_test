
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, SlidersHorizontal, Trophy, TrendingUp, Users, Sparkles, ArrowRight, CalendarDays, Activity, Gauge, Zap } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart, CartesianGrid, LineChart, Line, Legend } from 'recharts'
import { useI18n } from '../features/i18n/i18n'
import { useLastTournamentLabel, useStandings, usePlayerCards, type StandingsRow, type PlayerCard } from '../features/elo/hooks'
import { normalizeKey } from '../lib/csv'
import { useModal } from '../components/Modal'
import PlayerProfileModalContent from '../components/modals/PlayerProfileModalContent'
import Button from '../components/ui/Button'
import Segmented from '../components/ui/Segmented'
import Skeleton from '../components/ui/Skeleton'
import NewsCarousel from '../components/NewsCarousel'
import { parseOutcome } from '../lib/outcome'

function median(values: number[]) {
  if (!values.length) return Number.NaN
  const arr = [...values].sort((a, b) => a - b)
  const mid = Math.floor(arr.length / 2)
  return arr.length % 2 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2
}

function parseWinrate(winrateText: string) {
  const s = (winrateText || '').toString().trim()
  if (!s) return Number.NaN
  if (s.includes('%')) {
    const n = Number(s.replace('%', '').trim())
    return Number.isFinite(n) ? n : Number.NaN
  }
  const n = Number(s)
  return Number.isFinite(n) ? n : Number.NaN
}


function parseDelta(s: string) {
  const v = Number(String(s ?? '').replace(',', '.'))
  return Number.isFinite(v) ? v : 0
}

function toDayKey(dateStr: string) {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

function toMonthKey(dateStr: string) {
  const d = parseLooseDate(dateStr)
  if (!d) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function parseLooseDate(dateStr: string): Date | null {
  const s = String(dateStr ?? '').trim()
  if (!s) return null
  // Common formats in the sheets: "DD.MM.YYYY" or ISO.
  const m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (m) {
    const dd = Number(m[1])
    const mm = Number(m[2])
    const yy = Number(m[3])
    const d = new Date(Date.UTC(yy, mm - 1, dd))
    return Number.isNaN(d.getTime()) ? null : d
  }
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d
}

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function parseEloFromParen(text: string) {
  // "Name (1500)" -> 1500
  const m = String(text ?? '').match(/\(([-+]?\d+(?:[\.,]\d+)?)\)/)
  if (!m) return Number.NaN
  const v = Number(m[1].replace(',', '.'))
  return Number.isFinite(v) ? v : Number.NaN
}
function buildDistribution(ratings: number[]) {
  if (!ratings.length) return []
  const min = Math.min(...ratings)
  const max = Math.max(...ratings)
  const step = 50
  const start = Math.floor(min / step) * step
  const end = Math.ceil(max / step) * step
  const bins: { bucket: string; from: number; to: number; count: number }[] = []
  for (let a = start; a < end; a += step) bins.push({ bucket: `${a}–${a + step}`, from: a, to: a + step, count: 0 })
  for (const r of ratings) {
    const idx = Math.min(bins.length - 1, Math.max(0, Math.floor((r - start) / step)))
    bins[idx].count += 1
  }
  return bins
}

function quantile(sortedAsc: number[], q: number) {
  if (!sortedAsc.length) return Number.NaN
  const pos = (sortedAsc.length - 1) * q
  const base = Math.floor(pos)
  const rest = pos - base
  if (sortedAsc[base + 1] === undefined) return sortedAsc[base]
  return sortedAsc[base] + rest * (sortedAsc[base + 1] - sortedAsc[base])
}

function classForRating(rating: number, cut25: number, cut50: number, cut75: number): 'A' | 'B' | 'C' | 'D' {
  if (!Number.isFinite(rating)) return 'D'
  if (rating >= cut75) return 'A'
  if (rating >= cut50) return 'B'
  if (rating >= cut25) return 'C'
  return 'D'
}

function ClassPill({ cls }: { cls: 'A' | 'B' | 'C' | 'D' }) {
  const map: Record<string, string> = {
    A: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200',
    B: 'border-sky-400/25 bg-sky-400/10 text-sky-200',
    C: 'border-amber-400/25 bg-amber-400/10 text-amber-200',
    D: 'border-slate-400/20 bg-white/5 text-slate-200',
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${map[cls]}`}>
      Class {cls}
    </span>
  )
}

function GlassTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm shadow-soft backdrop-blur">
      <div className="text-slate-200 font-semibold">{label}</div>
      <div className="text-slate-300">{payload[0].value}</div>
    </div>
  )
}

export default function HomePage() {
  const { slug } = useParams()
  const nav = useNavigate()
  const { t } = useI18n()
  const { openModal, closeModal } = useModal()

  const [mode, setMode] = useState<'elo' | 'dcpr'>('elo')
  const [query, setQuery] = useState('')

  const [matchQuery, setMatchQuery] = useState('')
  const [matchTournament, setMatchTournament] = useState('ALL')


  const standingsElo = useStandings('elo')
  const standingsDcpr = useStandings('dcpr')
  const standings = mode === 'elo' ? standingsElo : standingsDcpr
  const lastTournament = useLastTournamentLabel()
  const cardsMode = usePlayerCards(mode)
  // Shared data (for "Zajímavé zápasy"), regardless of the toggle.
  const cardsElo = usePlayerCards('elo')
  const cardsDcpr = usePlayerCards('dcpr')

  // IMPORTANT: define rows BEFORE any hooks that reference it.
  // Otherwise we can hit a TDZ runtime error in production builds.
  const rows = standings.data ?? []


  // Open player profile modal when route contains /player/:slug
  useEffect(() => {
    if (!slug) return
    const all = [...(standingsElo.data ?? []), ...(standingsDcpr.data ?? [])]
    const p = all.find((r) => r.slug === slug) || (standings.data ?? []).find((r) => r.slug === slug)
    if (!p) return
    openModal({
      title: p.player,
      fullscreen: true,
      content: (
        <PlayerProfileModalContent
          player={p}
          mode={mode}
          onClose={() => {
            closeModal()
            nav('/')
          }}
        />
      ),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, rows.length, mode])
  const filtered = useMemo(() => {
    const q = normalizeKey(query)
    if (!q) return rows
    return rows.filter((r) => normalizeKey(r.player).includes(q))
  }, [rows, query])

  const top = useMemo(() => filtered.slice(0, 50), [filtered])

  const stats = useMemo(() => {
    // The same logic is used for both modes; the sheet differs by mode.
    // MEDIAN ELO: median of ratings (column B in the sheet)
    // TOTAL GAMES: sum of games (column C) divided by 2 (each match counts for both players)
    // UNIQUE PLAYERS: number of non-empty rows
    const ratings = rows.map((r) => r.rating).filter((n) => Number.isFinite(n))
    const gamesSum = rows.map((r) => r.games).filter((n) => Number.isFinite(n)).reduce((a, b) => a + b, 0)
    return {
      uniquePlayers: rows.length,
      medianElo: Math.round(median(ratings) || 0),
      totalGames: Math.round(gamesSum / 2),
    }
  }, [rows])

  
  const matchStats = useMemo(() => {
    // Data mapping (mode-sensitive): computed from "Player cards (CSV)" sheets.
    const cards = cardsMode.data ?? []
    const cutoff7 = daysAgo(7)
    const cutoff30 = daysAgo(30)

    const active7 = new Set<string>()
    const active30 = new Set<string>()
    const seenBefore30 = new Set<string>()
    const seenLast30 = new Set<string>()

    const matchIds7 = new Set<number>()
    const matchIds30 = new Set<number>()

    let sumAbsDelta = 0
    let deltaCount = 0

    const byMatch = new Map<number, PlayerCard[]>()
    for (const c of cards) {
      if (!Number.isFinite(c.matchId)) continue
      const arr = byMatch.get(c.matchId) ?? []
      arr.push(c)
      byMatch.set(c.matchId, arr)
    }

    for (const c of cards) {
      const key = normalizeKey(c.player)
      if (!key) continue
      const d = parseLooseDate(c.date)
      if (d) {
        if (d >= cutoff7) active7.add(key)
        if (d >= cutoff30) active30.add(key)
        if (d >= cutoff30) seenLast30.add(key)
        else seenBefore30.add(key)

        if (d >= cutoff7 && Number.isFinite(c.matchId)) matchIds7.add(c.matchId)
        if (d >= cutoff30 && Number.isFinite(c.matchId)) matchIds30.add(c.matchId)
      }

      const dv = parseDelta(c.delta)
      if (Number.isFinite(dv)) {
        sumAbsDelta += Math.abs(dv)
        deltaCount += 1
      }
    }

    const newPlayers30 = [...seenLast30].filter((p) => !seenBefore30.has(p)).length

    // Upset %: lower pre-match ELO beats higher pre-match ELO.
    let upsetWins = 0
    let decidedMatches = 0
    for (const group of byMatch.values()) {
      const wRow = group.find((r) => parseOutcome(r.result) === "W")
      const lRow = group.find((r) => parseOutcome(r.result) === "L")
      if (!wRow || !lRow) continue
      // Each row stores opponent pre-match ELO in parentheses.
      const winnerPre = parseEloFromParen(lRow.opponent)
      const loserPre = parseEloFromParen(wRow.opponent)
      if (!Number.isFinite(winnerPre) || !Number.isFinite(loserPre)) continue
      decidedMatches += 1
      if (winnerPre < loserPre) upsetWins += 1
    }
    const upsetPct = decidedMatches ? (upsetWins / decidedMatches) * 100 : 0

    return {
      active7: active7.size,
      active30: active30.size,
      newPlayers30,
      matchesWeek: matchIds7.size,
      matchesMonth: matchIds30.size,
      avgAbsDelta: deltaCount ? sumAbsDelta / deltaCount : 0,
      upsetPct,
    }
  }, [cardsMode.data])

  const matchPairs = useMemo(() => {
    const cards = cardsMode.data ?? []
    const byMatch = new Map<number, PlayerCard[]>()
    for (const c of cards) {
      if (!Number.isFinite(c.matchId)) continue
      const arr = byMatch.get(c.matchId) ?? []
      arr.push(c)
      byMatch.set(c.matchId, arr)
    }

    const pairs: {
      matchId: number
      date: string
      tournament: string
      a: string
      b: string
      aPre: number
      bPre: number
      winner: string | null
      upset: boolean
      diff: number
    }[] = []

    for (const [matchId, group] of byMatch.entries()) {
      const sides = group.slice(0, 2)
      if (sides.length !== 2) continue
      const A = sides[0]
      const B = sides[1]
      const aDelta = parseDelta(A.delta)
      const bDelta = parseDelta(B.delta)
      const aPre = A.elo - aDelta
      const bPre = B.elo - bDelta
      const aOut = parseOutcome(A.result)
      const bOut = parseOutcome(B.result)

      let winner: string | null = null
      if (aOut === 'W' || bOut === 'L') winner = A.player
      else if (bOut === 'W' || aOut === 'L') winner = B.player

      const fav = aPre >= bPre ? A.player : B.player
      const diff = Math.abs(aPre - bPre)
      const upset = winner ? winner !== fav : false

      pairs.push({
        matchId,
        date: A.date || B.date,
        tournament: A.tournament || B.tournament,
        a: A.player,
        b: B.player,
        aPre,
        bPre,
        winner,
        upset,
        diff,
      })
    }

    return pairs
      .filter((p) => p.date)
      .sort((a, b) => {
        const da = new Date(a.date).getTime()
        const db = new Date(b.date).getTime()
        if (!Number.isNaN(da) && !Number.isNaN(db)) return db - da
        return b.matchId - a.matchId
      })
  }, [cardsMode.data])


  const interestingMatches = useMemo(() => {
  const cutoff = daysAgo(30)

  const allItems = [
    ...(cardsElo.data ?? []).map((x) => ({ ...x, __src: 'ELO' as const })),
    ...(cardsDcpr.data ?? []).map((x) => ({ ...x, __src: 'DCPR' as const })),
  ]

  type M = {
    key: string
    matchId: number
    date: Date
    tournament: string
    left: string
    right: string
    leftElo: number
    rightElo: number
    score: string
    src: 'ELO' | 'DCPR'
    avg: number
    diff: number
  }

  const byKey = new Map<string, any[]>()
  for (const it of allItems) {
    const d = parseLooseDate(it.date)
    if (!d || d < cutoff) continue
    if (!Number.isFinite(it.matchId)) continue
    const key = `${it.__src}::${it.matchId}`
    const arr = byKey.get(key) ?? []
    arr.push({ ...it, __d: d })
    byKey.set(key, arr)
  }

  const extractScore = (s: any) => {
    const str = String(s ?? '')
    const m = str.match(/(\d+)\s*-\s*(\d+)/)
    return m ? `${m[1]}-${m[2]}` : str.trim()
  }

  const matches: M[] = []
  for (const [key, group] of byKey.entries()) {
    // Each match has two rows (two perspectives)
    const winnerRow = group.find((r) => parseOutcome(r.result) === 'W')
    const loserRow = group.find((r) => parseOutcome(r.result) === 'L')
    if (!winnerRow || !loserRow) continue

    const matchId = Number(winnerRow.matchId)
    const src = String(key.split('::')[0]) as 'ELO' | 'DCPR'
    const date = (winnerRow.__d as Date) || (loserRow.__d as Date)
    const tournament = String(winnerRow.tournament || loserRow.tournament || '')

    const winner = String(winnerRow.player ?? '').trim()
    const loser = String(loserRow.player ?? '').trim()
    if (!winner || !loser) continue

    // Pre-match ELO is stored in opponent cell (in parentheses)
    const winnerPre = parseEloFromParen(loserRow.opponent)
    const loserPre = parseEloFromParen(winnerRow.opponent)
    if (!Number.isFinite(winnerPre) || !Number.isFinite(loserPre)) continue

    const score = extractScore(winnerRow.result)

    matches.push({
      key,
      matchId,
      date,
      tournament,
      left: winner,
      right: loser,
      leftElo: winnerPre,
      rightElo: loserPre,
      score,
      src,
      avg: (winnerPre + loserPre) / 2,
      diff: Math.abs(winnerPre - loserPre),
    })
  }

  const pickTopDistinct = (
    list: M[],
    scoreFn: (m: M) => number,
    count: number,
    usedMatchKeys: Set<string>,
    usedPlayers: Set<string>
  ) => {
    const out: M[] = []
    const sorted = [...list].sort((a, b) => scoreFn(b) - scoreFn(a))
    for (const m of sorted) {
      if (usedMatchKeys.has(m.key)) continue
      const a = normalizeKey(m.left)
      const b = normalizeKey(m.right)
      // Avoid repeating the same player across the showcased matches
      if (usedPlayers.has(a) || usedPlayers.has(b)) continue
      usedMatchKeys.add(m.key)
      usedPlayers.add(a)
      usedPlayers.add(b)
      out.push(m)
      if (out.length >= count) break
    }
    return out
  }

  const used = new Set<string>()
  const usedPlayers = new Set<string>()
  const topCombined = pickTopDistinct(matches, (m) => m.avg, 2, used, usedPlayers)
  const topDiff = pickTopDistinct(matches, (m) => m.diff, 2, used, usedPlayers)

  return { topCombined, topDiff }
}, [cardsElo.data, cardsDcpr.data])


  const matchTournaments = useMemo(() => {
    const set = new Set<string>()
    for (const p of matchPairs) if (p.tournament) set.add(p.tournament)
    return ['ALL', ...Array.from(set).sort((a, b) => a.localeCompare(b))]
  }, [matchPairs])

  const filteredMatches = useMemo(() => {
    const q = normalizeKey(matchQuery)
    let list = matchPairs
    if (matchTournament !== 'ALL') list = list.filter((m) => m.tournament === matchTournament)
    if (q) {
      list = list.filter((m) => normalizeKey(m.a).includes(q) || normalizeKey(m.b).includes(q) || normalizeKey(m.tournament).includes(q))
    }
    return list
  }, [matchPairs, matchTournament, matchQuery])





  const distribution = useMemo(() => buildDistribution(rows.map((r) => r.rating).filter(Number.isFinite)), [rows])

  const avgEloByMonth = useMemo(() => {
    const cards = cardsMode.data ?? []
    const bucket = new Map<string, { sum: number; n: number }>()
    for (const c of cards) {
      if (!Number.isFinite(c.elo)) continue
      const mk = toMonthKey(c.date)
      if (!mk) continue
      const cur = bucket.get(mk) ?? { sum: 0, n: 0 }
      cur.sum += c.elo
      cur.n += 1
      bucket.set(mk, cur)
    }
    return Array.from(bucket.entries())
      .map(([month, v]) => ({ month, avgElo: v.n ? v.sum / v.n : 0 }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }, [cardsMode.data])

  const playersByClass = useMemo(() => {
    const counts: Record<'A' | 'B' | 'C' | 'D', number> = { A: 0, B: 0, C: 0, D: 0 }
    for (const r of rows) {
      if (r.ratingClass) counts[r.ratingClass] += 1
    }
    return (['A', 'B', 'C', 'D'] as const).map((cls) => ({ cls, count: counts[cls] }))
  }, [rows]ws])


  const monthlyActiveSeries = useMemo(() => {
    const items = cardsMode.data ?? []

    // Last 12 months (including current month)
    const now = new Date()
    const months: string[] = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
      months.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`)
    }

    const map = new Map<string, Set<string>>()
    for (const m of months) map.set(m, new Set())

    const earliest = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1))
    for (const it of items) {
      const d = parseLooseDate(it.date)
      if (!d) continue
      if (d < earliest) continue
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
      if (!map.has(key)) continue
      const p = normalizeKey(it.player)
      if (!p) continue
      map.get(key)!.add(p)
    }

    return months.map((month) => ({ month, players: map.get(month)?.size ?? 0 }))
  }, [cardsMode.data])

  const winrateByDiffOverall = useMemo(() => {
    const cards = cardsMode.data ?? []
    const byMatch = new Map<number, PlayerCard[]>()
    for (const c of cards) {
      if (!Number.isFinite(c.matchId)) continue
      const arr = byMatch.get(c.matchId) ?? []
      arr.push(c)
      byMatch.set(c.matchId, arr)
    }

    const binStep = 50
    const diffBins = new Map<number, { favWins: number; total: number }>()

    for (const group of byMatch.values()) {
      const sides = group.slice(0, 2)
      if (sides.length !== 2) continue
      const A = sides[0]
      const B = sides[1]
      const aPre = A.elo - parseDelta(A.delta)
      const bPre = B.elo - parseDelta(B.delta)
      if (!Number.isFinite(aPre) || !Number.isFinite(bPre)) continue

      const aOut = parseOutcome(A.result)
      const bOut = parseOutcome(B.result)
      let winner: 'A' | 'B' | null = null
      if (aOut === 'W' || bOut === 'L') winner = 'A'
      else if (bOut === 'W' || aOut === 'L') winner = 'B'
      else winner = null
      if (!winner) continue

      const fav: 'A' | 'B' = aPre >= bPre ? 'A' : 'B'
      const diff = Math.abs(aPre - bPre)
      const from = Math.floor(diff / binStep) * binStep
      const cur = diffBins.get(from) ?? { favWins: 0, total: 0 }
      cur.total += 1
      if (winner === fav) cur.favWins += 1
      diffBins.set(from, cur)
    }

    return [...diffBins.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([from, v]) => ({
        bucket: `${from}–${from + binStep}`,
        from,
        to: from + binStep,
        winrate: v.total ? (v.favWins / v.total) * 100 : 0,
        total: v.total,
      }))
  }, [cardsMode.data])

  // Deep link: open player modal if route matches /player/:slug
  useEffect(() => {
    if (!slug) return
    const p = rows.find((r) => r.slug === slug) || null
    if (!p) return
    openModal({
      title: p.player,
      content: <PlayerProfileModalContent player={p} mode={mode} onClose={() => nav(`/`)} />,
      size: 'xl',
      onClose: () => nav(`/`),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, rows])

  const openPlayer = (p: StandingsRow) => {
    nav(`/player/${p.slug}`)
  }

  const loading = standings.isLoading || standingsElo.isLoading || standingsDcpr.isLoading || lastTournament.isLoading || cardsMode.isLoading

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-indigo-500/15 via-slate-950 to-slate-950 p-6 sm:p-10 shadow-soft">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-0 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl" />

        <div className="space-y-6">
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div className="flex items-center gap-4">
      {/* Logo placeholder */}
      <div
        className="h-14 w-14 shrink-0 rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/30 via-slate-950/40 to-cyan-400/15 shadow-soft"
        aria-hidden
      />
      <div className="pl-1">
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">DC ELO</h1>
        <p className="max-w-2xl text-pretty text-slate-300 leading-relaxed">BY GRAIL SERIES</p>
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-3">
      <Segmented
        value={mode}
        onChange={(v) => setMode(v as any)}
        options={[
          { value: 'elo', label: 'ELO' },
          { value: 'dcpr', label: 'DCPR' },
        ]}
      />
    </div>

  {/* Slider + CTA */}
  <div className="grid gap-4 lg:grid-cols-12 items-stretch">
    <div className="lg:col-span-10 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/35 shadow-soft">
      <NewsCarousel
        items={[
          {
            tag: 'Update',
            image: '/assets/images/slider/placeholder-1.svg',
            title: 'Vylepšené grafy a rychlejší profil hráče',
            date: lastTournament.data || '—',
            excerpt: 'Nové metriky (upsety, aktivita), více grafů a přehlednější profil.',
          },
          {
            tag: 'Insight',
            image: '/assets/images/slider/placeholder-2.svg',
            title: 'Kalibrace ELO: winrate vs rozdíl ratingu',
            date: 'Validace',
            excerpt: 'Porovnání empirické winrate a expected křivky podle ELO vzorce.',
          },
          {
            tag: 'Tip',
            image: '/assets/images/slider/placeholder-3.svg',
            title: 'Profil hráče: období, zoom a trendy',
            date: 'Profil',
            excerpt: 'Každý hráč má přepínač období a zoom pro detailní průběh.',
          },
        ]}
      />
    </div>

    <div className="lg:col-span-2 flex">
      <Button
        onClick={() => {
          const el = document.getElementById('leaderboard')
          el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }}
        variant="primary"
        className="w-full justify-center rounded-3xl"
      >
        {'Hráči'}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  </div>


  </div>

  {/* Primary stats */}
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between min-h-[92px]" title="Medián ratingu (z hodnot ratingu ve standings).">
      <div className="flex items-center gap-2 text-slate-300 text-xs">
        
      </div>
      <div className="mt-auto text-2xl font-semibold text-white">{loading ? '—' : stats.medianElo}</div>
    </div>
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between min-h-[92px]" title="Součet odehraných her / 2 (každý zápas je v datech 2×).">
      <div className="flex items-center gap-2 text-slate-300 text-xs">
        
      </div>
      <div className="mt-auto text-2xl font-semibold text-white">{loading ? '—' : stats.totalGames.toLocaleString()}</div>
    </div>
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between min-h-[92px]" title="Počet unikátních hráčů ve standings (počet řádků).">
      <div className="flex items-center gap-2 text-slate-300 text-xs">
        
      </div>
      <div className="mt-auto text-2xl font-semibold text-white">{loading ? '—' : stats.uniquePlayers}</div>
    </div>
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between min-h-[92px]" title="Nejnovější záznam z listu Data (poslední hodnota ve sloupci B).">
      <div className="flex items-center gap-2 text-slate-300 text-xs">
        
      </div>
      <div className="mt-auto text-lg font-semibold text-white">{loading ? '—' : (lastTournament.data || '—')}</div>
    </div>
  </div>

  {/* Activity & quality stats */}
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between min-h-[92px]" title="Počet unikátních hráčů, kteří hráli alespoň 1 zápas v posledních 7 dnech.">
      <div className="flex items-center gap-2 text-slate-300 text-xs">
        
      </div>
      <div className="mt-auto text-2xl font-semibold text-white">{loading ? '—' : matchStats.active7}</div>
    </div>

    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between min-h-[92px]" title="Počet unikátních hráčů, kteří hráli alespoň 1 zápas v posledních 30 dnech.">
      <div className="flex items-center gap-2 text-slate-300 text-xs">
        
      </div>
      <div className="mt-auto text-2xl font-semibold text-white">{loading ? '—' : matchStats.active30}</div>
    </div>

    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between min-h-[92px]" title="Hráči, kteří se objevili v posledních 30 dnech a předtím v datech nebyli.">
      <div className="flex items-center gap-2 text-slate-300 text-xs">
        
      </div>
      <div className="mt-auto text-2xl font-semibold text-white">{loading ? '—' : matchStats.newPlayers30}</div>
    </div>

    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between min-h-[92px]" title="Počet unikátních zápasů (Match ID) za posledních 7 dní.">
      <div className="flex items-center gap-2 text-slate-300 text-xs">
        
      </div>
      <div className="mt-auto text-2xl font-semibold text-white">{loading ? '—' : matchStats.matchesWeek.toLocaleString()}</div>
    </div>

    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between min-h-[92px]" title="Počet unikátních zápasů (Match ID) za posledních 30 dní.">
      <div className="flex items-center gap-2 text-slate-300 text-xs">
        
      </div>
      <div className="mt-auto text-2xl font-semibold text-white">{loading ? '—' : matchStats.matchesMonth.toLocaleString()}</div>
    </div>

    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between min-h-[92px]" title="Průměr absolutní hodnoty změny ratingu (|Δ|) na řádek; orientační velikost změn.">
      <div className="flex items-center gap-2 text-slate-300 text-xs">
        
      </div>
      <div className="mt-auto text-2xl font-semibold text-white">{loading ? '—' : matchStats.avgAbsDelta.toFixed(1)}</div>
    </div>

    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:col-span-2 lg:col-span-6" title="Podíl zápasů, kde hráč s nižším pre-match ELO porazil hráče s vyšším pre-match ELO.">
      <div className="flex items-center gap-2 text-slate-300 text-xs">
        <Trophy className="h-4 w-4" /> Upset %
      </div>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-2xl font-semibold text-white">{loading ? '—' : `${matchStats.upsetPct.toFixed(1)}%`}</div>
        <div className="text-xs text-slate-400">výhra slabšího nad silnějším</div>
      </div>
    </div>
  </div>

  <div className="text-xs text-slate-400">
    {'Zdroj: Google Sheets • '}
    <span className="text-slate-200">{loading ? 'načítám…' : (lastTournament.data || '—')}</span>
  </div>
</div>

<div className="mt-6 grid gap-6 lg:grid-cols-12">
  <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-soft">
    <div className="flex items-center justify-between">
      <div className="text-sm font-semibold text-white">Zajímavé zápasy</div>
      <div className="text-xs text-slate-400">posledních 30 dní • ELO + DCPR</div>
    </div>

    <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
      <div className="grid grid-cols-12 bg-white/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-200">
        <div className="col-span-10">Zápas</div>
        <div className="col-span-2 text-right">Zdroj</div>
      </div>

      <div className="px-3 py-2 text-[11px] uppercase tracking-wide text-slate-400 bg-slate-950/40 border-t border-white/10">
        Nejvyšší průměrné ELO (oba hráči co nejvýš)
      </div>
      {loading ? (
        <div className="p-3 space-y-2">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        (interestingMatches.topCombined.length ? interestingMatches.topCombined : []).map((m) => (
          <div key={m.key} className="grid grid-cols-12 px-3 py-2 text-sm text-slate-200 hover:bg-white/5">
            <div className="col-span-10 text-slate-200">
              <span className="font-semibold text-white">{m.left}</span>
              <span className="text-slate-300">, {Math.round(m.leftElo)}</span>
              <span className="mx-3 inline-flex items-center rounded-full border border-white/10 bg-slate-950/40 px-2 py-0.5 text-xs font-semibold text-slate-100">{m.score || '—'}</span>
              <span className="text-slate-300">{Math.round(m.rightElo)}, </span>
              <span className="font-semibold text-white">{m.right}</span>
            </div>
            <div className="col-span-2 text-right text-slate-300">{m.src}</div>
          </div>
        ))
      )}

      <div className="px-3 py-2 text-[11px] uppercase tracking-wide text-slate-400 bg-slate-950/40 border-t border-white/10">
        Největší rozdíl ELO (největší mismatch)
      </div>
      {loading ? (
        <div className="p-3 space-y-2">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        (interestingMatches.topDiff.length ? interestingMatches.topDiff : []).map((m) => (
          <div key={m.key} className="grid grid-cols-12 px-3 py-2 text-sm text-slate-200 hover:bg-white/5">
            <div className="col-span-10 text-slate-200">
              <span className="font-semibold text-white">{m.left}</span>
              <span className="text-slate-300">, {Math.round(m.leftElo)}</span>
              <span className="mx-3 inline-flex items-center rounded-full border border-white/10 bg-slate-950/40 px-2 py-0.5 text-xs font-semibold text-slate-100">{m.score || '—'}</span>
              <span className="text-slate-300">{Math.round(m.rightElo)}, </span>
              <span className="font-semibold text-white">{m.right}</span>
            </div>
            <div className="col-span-2 text-right text-slate-300">{m.src}</div>
          </div>
        ))
      )}
    </div>
  </div>

  <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-soft">
    <div className="text-sm font-semibold text-white">Rekordy & highlights</div>
    <div className="mt-1 text-xs text-slate-400">Rychlé zajímavosti pro aktuální režim</div>

    <div className="mt-4 grid gap-3">
      {(() => {
        const rr = rows
        const mostGames = [...rr].sort((a, b) => b.games - a.games)[0]
        const bestWr = [...rr]
          .filter((x) => x.games >= 10)
          .sort((a, b) => parseWinrate(b.winrate) - parseWinrate(a.winrate))[0]
        const topRating = [...rr].sort((a, b) => b.rating - a.rating)[0]
        return (
          <>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-slate-400">Nejvíc her</div>
              <div className="mt-1 flex items-baseline justify-between gap-2">
                <div className="truncate font-semibold text-slate-100">{mostGames?.player || '—'}</div>
                <div className="text-slate-200 font-semibold">{mostGames ? mostGames.games : '—'}</div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-slate-400">Nejlepší winrate (min. 10 her)</div>
              <div className="mt-1 flex items-baseline justify-between gap-2">
                <div className="truncate font-semibold text-slate-100">{bestWr?.player || '—'}</div>
                <div className="text-slate-200 font-semibold">{bestWr?.winrate || '—'}</div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-slate-400">Nejvyšší rating</div>
              <div className="mt-1 flex items-baseline justify-between gap-2">
                <div className="truncate font-semibold text-slate-100">{topRating?.player || '—'}</div>
                <div className="text-slate-200 font-semibold">{topRating ? topRating.rating : '—'}</div>
              </div>
            </div>
          </>
        )
      })()}
    </div>
  </div>
</div>

        {/* Distribution + Tips */}
      <section id="distribution" className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-12 rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">{mode === 'elo' ? 'Rozložení ELO' : 'Rozložení DCPR'}</div>
              <div className="text-xs text-slate-400">{t('dist_sub') || 'Kolik hráčů je v jednotlivých pásmech'}</div>
            </div>
            <div className="text-xs text-slate-400">{mode.toUpperCase()}</div>
          </div>
          <div className="mt-5 h-64">
            {loading ? (
              <Skeleton className="h-full w-full rounded-2xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution} margin={{ left: 6, right: 6, top: 10, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="bucket" tick={{ fill: 'rgba(226,232,240,0.6)', fontSize: 11 }} axisLine={false} tickLine={false} interval={1} height={46} />
                  <YAxis tick={{ fill: 'rgba(226,232,240,0.55)', fontSize: 12 }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip content={<GlassTooltip />} />
                  <Bar dataKey="count" radius={[10, 10, 0, 0]} fill="rgba(99,102,241,0.65)" isAnimationActive animationDuration={900} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </section>


      {/* Extra charts */}
      <section id="stats" className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-6 rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Ranking Class (A–D)</div>
              <div className="text-xs text-slate-400">Kolik hráčů spadá do tříd podle ratingu</div>
            </div>
            <div className="text-xs text-slate-400">{mode.toUpperCase()}</div>
          </div>
          <div className="mt-5 h-56">
            {loading ? (
              <Skeleton className="h-full w-full rounded-2xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={playersByClass} margin={{ left: 6, right: 6, top: 10, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="cls" tick={{ fill: 'rgba(226,232,240,0.6)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(226,232,240,0.55)', fontSize: 12 }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip content={<GlassTooltip />} />
                  <Bar dataKey="count" radius={[10, 10, 0, 0]} fill="rgba(14,165,233,0.55)" isAnimationActive animationDuration={900} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="lg:col-span-6 rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Průměrné ELO v čase</div>
              <div className="text-xs text-slate-400">Průměr post-match ratingů podle měsíce</div>
            </div>
            <div className="text-xs text-slate-400">{mode.toUpperCase()}</div>
          </div>
          <div className="mt-5 h-56">
            {loading ? (
              <Skeleton className="h-full w-full rounded-2xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={avgEloByMonth} margin={{ left: 6, right: 12, top: 10, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(226,232,240,0.6)', fontSize: 11 }} axisLine={false} tickLine={false} interval={Math.max(0, Math.floor(avgEloByMonth.length / 6) - 1)} />
                  <YAxis tick={{ fill: 'rgba(226,232,240,0.55)', fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip content={<GlassTooltip />} />
                  <Line type="monotone" dataKey="avgElo" stroke="rgba(129,140,248,0.9)" dot={false} isAnimationActive animationDuration={900} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="lg:col-span-6 rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Aktivní hráči podle měsíce</div>
              <div className="text-xs text-slate-400">Kolik unikátních hráčů hrálo v měsíci</div>
            </div>
            <div className="text-xs text-slate-400">{mode.toUpperCase()}</div>
          </div>
          <div className="mt-5 h-56">
            {loading ? (
              <Skeleton className="h-full w-full rounded-2xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyActiveSeries} margin={{ left: 6, right: 6, top: 10, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: 'rgba(226,232,240,0.6)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    tickFormatter={(v: any, idx: number) => (idx % 2 === 0 ? String(v).slice(2) : '')}
                  />
                  <YAxis tick={{ fill: 'rgba(226,232,240,0.55)', fontSize: 12 }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip content={<GlassTooltip />} />
                  <Bar dataKey="players" radius={[10, 10, 0, 0]} fill="rgba(34,197,94,0.45)" isAnimationActive animationDuration={900} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="lg:col-span-6 rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Winrate podle ELO rozdílu</div>
              <div className="text-xs text-slate-400">Osa X: rozdíl ratingu (favorit vs underdog) • Osa Y: % výher favorita</div>
            </div>
            <div className="text-xs text-slate-400">{mode.toUpperCase()}</div>
          </div>
          <div className="mt-5 h-56">
            {loading ? (
              <Skeleton className="h-full w-full rounded-2xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={winrateByDiffOverall} margin={{ left: 6, right: 12, top: 10, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="bucket" tick={{ fill: 'rgba(226,232,240,0.6)', fontSize: 11 }} axisLine={false} tickLine={false} interval={1} height={46} />
                  <YAxis tick={{ fill: 'rgba(226,232,240,0.55)', fontSize: 12 }} axisLine={false} tickLine={false} width={40} domain={[0, 100]} />
                  <Tooltip content={<GlassTooltip />} />
                  <Line type="monotone" dataKey="winrate" stroke="rgba(251,191,36,0.9)" dot={false} isAnimationActive animationDuration={900} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section id="leaderboard" className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-white">{t('leaderboard_title') || 'Žebříček'}</div>
            <div className="text-xs text-slate-400">{t('leaderboard_sub') || 'Klikni na hráče pro detail.'}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-slate-200">
              <Search className="h-4 w-4 text-slate-300" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-56 bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder={t('search_placeholder') || 'Hledej hráče…'}
              />
            </div>
            <div className="text-xs text-slate-400">{loading ? 'načítám…' : `${filtered.length} hráčů`}</div>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
          <div className="overflow-x-auto">
            <div className="min-w-[980px]">
              <div className="grid grid-cols-[56px_1.6fr_120px_90px_70px_70px_70px_90px_90px] bg-white/5 px-4 py-3 text-xs font-semibold text-slate-200">
                <div>#</div>
                <div>{t('col_player') || 'Hráč'}</div>
                <div className="text-right">{mode.toUpperCase()}</div>
                <div className="text-right">{t('col_games') || 'Games'}</div>
                <div className="text-right">W</div>
                <div className="text-right">L</div>
                <div className="text-right">D</div>
                <div className="text-right">Peak</div>
                <div className="text-right">WR</div>
              </div>

              <div className="divide-y divide-white/5">
            {loading ? (
              <div className="p-4 space-y-2">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              top.map((r) => (
                <button
                  key={r.slug}
                  onClick={() => openPlayer(r)}
                  className="group grid w-full grid-cols-[56px_1.6fr_120px_90px_70px_70px_70px_90px_90px] items-center px-4 py-3 text-left text-sm text-slate-200 hover:bg-white/5 focus:bg-white/5 focus:outline-none"
                >
                  <div className="text-slate-400">{r.rank}</div>
                  <div className="min-w-0 font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{r.player}</span>
                      {r.rank === 1 ? <Trophy className="h-4 w-4 shrink-0 text-yellow-300" /> : null}
                      {r.ratingClass ? <ClassPill cls={r.ratingClass} /> : null}
                    </div>
                  </div>
                  <div className="text-right font-semibold text-white">{r.rating}</div>
                  <div className="text-right text-slate-300">{r.games}</div>
                  <div className="text-right text-slate-300">{r.win}</div>
                  <div className="text-right text-slate-300">{r.loss}</div>
                  <div className="text-right text-slate-300">{r.draw}</div>
                  <div className="text-right text-slate-300">{r.peak}</div>
                  <div className="text-right text-slate-300">{r.winrate}</div>
                </button>
              ))
            )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-400">
          {t('leaderboard_note') ||
            'Zobrazuju top 50 pro rychlost. Použij hledání pro další hráče.'}
        </div>
      </section>

      {/* Footer-style section */}
      
      {/* All matches */}
      <section id="matches" className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Všechny zápasy</div>
            <div className="text-xs text-slate-400">Filtruj DCPR/ELO, turnaj a hráče</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-10 min-w-[220px]">
              <div className="flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 text-slate-200">
                <Search className="h-4 w-4 text-slate-300" />
                <input
                  value={matchQuery}
                  onChange={(e) => setMatchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  placeholder="Hráč / turnaj…"
                />
              </div>
            </div>
            <div className="inline-flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 text-sm text-slate-200">
              <span className="text-slate-400">Turnaj</span>
              <select
                value={matchTournament}
                onChange={(e) => setMatchTournament(e.target.value)}
                className="bg-transparent text-slate-100 outline-none"
              >
                {matchTournaments.map((x) => (
                  <option key={x} value={x} className="bg-slate-950">
                    {x === 'ALL' ? 'Vše' : x}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
          <div className="overflow-x-auto">
            <div className="min-w-[980px]">
              <div className="grid grid-cols-[120px_220px_1.3fr_140px_120px_120px] bg-white/5 px-4 py-3 text-xs font-semibold text-slate-200">
                <div>Datum</div>
                <div>Turnaj</div>
                <div>Hráči</div>
                <div>Vítěz</div>
                <div className="text-right">ΔELO</div>
                <div className="text-right">Upset</div>
              </div>
              <div className="divide-y divide-white/5 max-h-[520px] overflow-auto">
                {loading ? (
                  <div className="p-4 space-y-2">
                    {[...Array(10)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full rounded-xl" />
                    ))}
                  </div>
                ) : filteredMatches.length ? (
                  filteredMatches.map((m) => (
                    <div key={m.matchId} className="grid grid-cols-[120px_220px_1.3fr_140px_120px_120px] items-center px-4 py-3 text-sm text-slate-200 hover:bg-white/5">
                      <div className="text-slate-400">{m.date ? new Date(m.date).toLocaleDateString() : '—'}</div>
                      <div className="font-semibold">{m.tournament || '—'}</div>
                      <div className="min-w-0">
                        <span className="truncate">{m.a}</span>
                        <span className="text-slate-400"> vs </span>
                        <span className="truncate">{m.b}</span>
                      </div>
                      <div className="font-semibold text-slate-100">{m.winner || '—'}</div>
                      <div className="text-right text-slate-300">{Math.round(m.diff)}</div>
                      <div className="text-right">
                        {m.winner ? (
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${m.upset ? 'border-amber-400/30 bg-amber-400/10 text-amber-200' : 'border-white/10 bg-white/5 text-slate-200'}`}>
                            {m.upset ? 'YES' : 'NO'}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-10 text-sm text-slate-400">Žádné zápasy pro aktuální filtr.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

<section className="rounded-3xl border border-white/10 bg-gradient-to-r from-slate-950/40 via-indigo-500/10 to-slate-950/40 p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-white">{t('cta_title') || 'Chceš to ještě víc vylepšit?'}</div>
            <div className="text-sm text-slate-300 leading-relaxed">
              {t('cta_sub') ||
                'Můžeme přidat turnajovou stránku, filtr podle sezóny a sdílení profilu hráče jako kartu.'}
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            {t('back_to_top') || 'Zpět nahoru'}
            <ArrowRight className="h-4 w-4 rotate-[-90deg]" />
          </Button>
        </div>
      </section>
    </div>
  )
}
