
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

type MatchOutcome = 'W' | 'L' | 'D' | 'U'

function parseOutcome(result: string): MatchOutcome {
  const s = String(result ?? '').trim().toUpperCase()
  if (!s) return 'U'
  if (s.startsWith('W') || s === '1') return 'W'
  if (s.startsWith('L') || s === '0') return 'L'
  if (s.startsWith('D') || s.startsWith('T')) return 'D'
  return 'U'
}

function toDayKey(dateStr: string) {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

function toMonthKey(dateStr: string) {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
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



  const rows = standings.data ?? []
  const filtered = useMemo(() => {
    const q = normalizeKey(query)
    if (!q) return rows
    return rows.filter((r) => normalizeKey(r.player).includes(q))
  }, [rows, query])

  const top = useMemo(() => filtered.slice(0, 50), [filtered])

  const stats = useMemo(() => {
    const eloRows = standingsElo.data ?? []

    const eloRatings = eloRows.map((r) => r.rating).filter((n) => Number.isFinite(n))

    const totalGames = eloRows
      .map((r) => r.games)
      .filter((n) => Number.isFinite(n))
      .reduce((a, b) => a + b, 0)

    return {
      uniquePlayers: eloRows.length || rows.length,
      medianElo: Math.round(median(eloRatings) || 0),
      totalGames,
    }
  }, [rows.length, standingsElo.data])

  
  const matchStats = useMemo(() => {
    const cards = cardsMode.data ?? []
    const now = new Date()
    const cutoff7 = new Date(now); cutoff7.setDate(cutoff7.getDate() - 7)
    const cutoff30 = new Date(now); cutoff30.setDate(cutoff30.getDate() - 30)

    const byMatch = new Map<number, PlayerCard[]>()
    for (const c of cards) {
      if (!Number.isFinite(c.matchId)) continue
      const arr = byMatch.get(c.matchId) ?? []
      arr.push(c)
      byMatch.set(c.matchId, arr)
    }

    const uniquePlayersAll = new Set<string>()
    const uniquePlayers7 = new Set<string>()
    const uniquePlayers30 = new Set<string>()
    const firstSeen = new Map<string, number>()
    const matchesByDay = new Map<string, number>()
    const matchesByMonthPlayers = new Map<string, Set<string>>()

    let sumAbsDelta = 0
    let deltaCount = 0

    let upsetWins = 0
    let decidedMatches = 0

    const diffBins: Record<string, { from: number; to: number; favWins: number; total: number }> = {}
    const binStep = 50
    const binKey = (d: number) => {
      const a = Math.floor(d / binStep) * binStep
      return `${a}–${a + binStep}`
    }

    for (const [mid, group] of byMatch.entries()) {
      // Match-level stats
      // Determine date from first valid row
      const dateStr = group.find((g) => g.date)?.date || ''
      const d = new Date(dateStr)
      const dOk = !Number.isNaN(d.getTime())

      // Count match per day
      if (dOk) {
        const k = toDayKey(dateStr)
        matchesByDay.set(k, (matchesByDay.get(k) ?? 0) + 1)

        const mk = toMonthKey(dateStr)
        if (mk) {
          const set = matchesByMonthPlayers.get(mk) ?? new Set<string>()
          for (const g of group) if (g.player) set.add(g.player)
          matchesByMonthPlayers.set(mk, set)
        }
      }

      // Need exactly two sides for upset + diff winrate
      const sides = group.slice(0, 2)
      if (sides.length === 2) {
        const a = sides[0]
        const b = sides[1]
        const aDelta = parseDelta(a.delta)
        const bDelta = parseDelta(b.delta)
        const aPre = a.elo - aDelta
        const bPre = b.elo - bDelta

        const aOut = parseOutcome(a.result)
        const bOut = parseOutcome(b.result)

        // Determine winner by outcomes; ignore draws/unknown
        let winner: 'A' | 'B' | null = null
        if (aOut === 'W' || bOut === 'L') winner = 'A'
        else if (bOut === 'W' || aOut === 'L') winner = 'B'
        else winner = null

        if (winner) {
          decidedMatches += 1
          const fav = aPre >= bPre ? 'A' : 'B'
          const diff = Math.abs(aPre - bPre)
          const key = binKey(diff)
          diffBins[key] = diffBins[key] ?? { from: Math.floor(diff / binStep) * binStep, to: Math.floor(diff / binStep) * binStep + binStep, favWins: 0, total: 0 }
          diffBins[key].total += 1
          if (winner === fav) diffBins[key].favWins += 1

          // Upset: underdog wins
          if (winner !== fav) upsetWins += 1
        }
      }
    }

    for (const c of cards) {
      if (!c.player) continue
      uniquePlayersAll.add(c.player)
      const d = new Date(c.date)
      if (!Number.isNaN(d.getTime())) {
        if (d >= cutoff7) uniquePlayers7.add(c.player)
        if (d >= cutoff30) uniquePlayers30.add(c.player)
        const ts = d.getTime()
        const prev = firstSeen.get(c.player)
        if (prev === undefined || ts < prev) firstSeen.set(c.player, ts)
      }
      sumAbsDelta += Math.abs(parseDelta(c.delta))
      deltaCount += 1
    }

    const newPlayers30 = Array.from(firstSeen.entries()).filter(([, ts]) => ts >= cutoff30.getTime()).length

    // Matches/day and matches/week averages from last 30 days and last 7 days
    const matchDays30 = 30
    const matchesLast30 = Array.from(matchesByDay.entries()).reduce((acc, [k, v]) => {
      const d = new Date(k)
      return !Number.isNaN(d.getTime()) && d >= cutoff30 ? acc + v : acc
    }, 0)
    const matchesLast7 = Array.from(matchesByDay.entries()).reduce((acc, [k, v]) => {
      const d = new Date(k)
      return !Number.isNaN(d.getTime()) && d >= cutoff7 ? acc + v : acc
    }, 0)

    const avgPerDay = matchesLast30 / matchDays30
    const avgPerWeek = matchesLast30 / (matchDays30 / 7)

    const upsetPct = decidedMatches ? (upsetWins / decidedMatches) * 100 : 0

    const activityTable = Array.from(matchesByMonthPlayers.entries())
      .map(([month, set]) => ({ month, players: set.size }))
      .sort((a, b) => a.month.localeCompare(b.month))

    const winrateByDiff = Object.entries(diffBins)
      .map(([bucket, v]) => ({ bucket, from: v.from, to: v.to, winrate: v.total ? (v.favWins / v.total) * 100 : 0, total: v.total }))
      .sort((a, b) => a.from - b.from)

    return {
      active7: uniquePlayers7.size,
      active30: uniquePlayers30.size,
      newPlayers30,
      matchesPerDay: avgPerDay,
      matchesPerWeek: avgPerWeek,
      avgAbsDelta: deltaCount ? sumAbsDelta / deltaCount : 0,
      upsetPct,
      activityTable,
      winrateByDiff,
    }
  }, [cardsMode.data, mode])

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
    const items = cardsMode.data ?? []
    const parse = (s: string) => {
      const v = (s || '').trim()
      if (!v) return null
      if (/\d{4}-\d{2}-\d{2}/.test(v)) {
        const d = new Date(v)
        return isNaN(d.getTime()) ? null : d
      }
      const m = v.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/)
      if (m) {
        const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
        return isNaN(d.getTime()) ? null : d
      }
      const d = new Date(v)
      return isNaN(d.getTime()) ? null : d
    }

    // Deduplicate (the sheet typically contains one row per player per match).
    type M = { key: string; date: Date; dateStr: string; tournament: string; a: string; b: string; eloA: number; eloB: number }
    const map = new Map<string, Partial<M> & { aSide?: { p: string; elo: number }; bSide?: { p: string; elo: number }; meta?: { date: Date; dateStr: string; tournament: string } }>()

    // Track latest date to define "recent".
    let maxTs = 0

    for (const it of items) {
      const d = parse(it.date)
      if (!d) continue
      const ts = d.getTime()
      if (ts > maxTs) maxTs = ts

      const p1 = it.player.trim()
      const p2 = it.opponent.trim()
      if (!p1 || !p2) continue

      const [a, b] = [p1, p2].sort((x, y) => x.localeCompare(y))
      const key = `${it.matchId}::${it.tournament}::${it.date}::${a}::${b}`

      if (!map.has(key)) map.set(key, {})
      const entry = map.get(key)!
      entry.meta = { date: d, dateStr: it.date, tournament: it.tournament }
      if (p1 === a) entry.aSide = { p: p1, elo: it.elo }
      else entry.bSide = { p: p1, elo: it.elo }
    }

    const all: M[] = []
    for (const [key, e] of map.entries()) {
      if (!e.meta || !e.aSide || !e.bSide) continue
      all.push({
        key,
        date: e.meta.date,
        dateStr: e.meta.dateStr,
        tournament: e.meta.tournament,
        a: e.aSide.p,
        b: e.bSide.p,
        eloA: e.aSide.elo,
        eloB: e.bSide.elo,
      })
    }

    const recentCut = maxTs ? maxTs - 1000 * 60 * 60 * 24 * 45 : 0 // last ~45 days
    const recent = recentCut ? all.filter((m) => m.date.getTime() >= recentCut) : all

    const topCombined = [...recent].sort((x, y) => (y.eloA + y.eloB) - (x.eloA + x.eloB)).slice(0, 3)
    const topDiff = [...recent].sort((x, y) => Math.abs(y.eloA - y.eloB) - Math.abs(x.eloA - x.eloB)).slice(0, 3)

    return { topCombined, topDiff }
  }, [cardsMode.data])


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



const classCuts = useMemo(() => {
    const ratings = rows
      .map((r) => r.rating)
      .filter((n) => Number.isFinite(n))
      .sort((a, b) => a - b)
    return {
      q25: quantile(ratings, 0.25),
      q50: quantile(ratings, 0.5),
      q75: quantile(ratings, 0.75),
    }
  }, [rows])

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
    const ratings = rows.map((r) => r.rating).filter((n) => Number.isFinite(n))
    const sorted = [...ratings].sort((a, b) => a - b)
    const q25 = quantile(sorted, 0.25)
    const q50 = quantile(sorted, 0.5)
    const q75 = quantile(sorted, 0.75)
    const counts: Record<'A' | 'B' | 'C' | 'D', number> = { A: 0, B: 0, C: 0, D: 0 }
    for (const r of rows) {
      counts[classForRating(r.rating, q25, q50, q75)] += 1
    }
    return (['A', 'B', 'C', 'D'] as const).map((cls) => ({ cls, count: counts[cls] }))
  }, [rows])


  const monthlyActiveSeries = useMemo(() => {
    const items = cardsMode.data ?? []
    const parse = (s: string) => {
      const v = (s || '').trim()
      if (!v) return null
      // Handles ISO, YYYY-MM-DD, and common CZ formats like DD.MM.YYYY
      if (/\d{4}-\d{2}-\d{2}/.test(v)) {
        const d = new Date(v)
        return isNaN(d.getTime()) ? null : d
      }
      const m = v.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/)
      if (m) {
        const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
        return isNaN(d.getTime()) ? null : d
      }
      const d = new Date(v)
      return isNaN(d.getTime()) ? null : d
    }

    const map = new Map<string, Set<string>>()
    for (const it of items) {
      const d = parse(it.date)
      if (!d) continue
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!map.has(key)) map.set(key, new Set())
      map.get(key)!.add(it.player)
    }

    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, set]) => ({ month, players: set.size }))
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

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7 space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
            >
              <Sparkles className="h-4 w-4 text-indigo-300" />
              <span>{t('hero_badge') || 'DC ELO'}</span>
            </motion.div>

            <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {t('hero_title') || 'DC ELO'}
            </h1>
            <p className="max-w-2xl text-pretty text-slate-300 leading-relaxed">
              {t('hero_subtitle') || 'BY GRAIL SERIES'}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Segmented
                value={mode}
                onChange={(v) => setMode(v as any)}
                options={[
                  { value: 'elo', label: 'ELO' },
                  { value: 'dcpr', label: 'DCPR' },
                ]}
              />
              <div className="h-10 flex-1 min-w-[220px]">
                <div className="flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 text-slate-200">
                  <Search className="h-4 w-4 text-slate-300" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    placeholder={t('search_placeholder') || 'Hledej hráče…'}
                  />
                </div>
              </div>
              <Button
                onClick={() => {
                  const el = document.getElementById('leaderboard')
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                variant="primary"
              >
                {t('cta_leaderboard') || 'Žebříček'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-slate-300 text-xs">
                  <TrendingUp className="h-4 w-4" /> MEDIAN ELO
                </div>
                <div className="mt-1 text-2xl font-semibold text-white">{loading ? '—' : stats.medianElo}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-slate-300 text-xs">
                  <SlidersHorizontal className="h-4 w-4" /> TOTAL GAMES
                </div>
                <div className="mt-1 text-2xl font-semibold text-white">{loading ? '—' : stats.totalGames.toLocaleString()}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-slate-300 text-xs">
                  <Users className="h-4 w-4" /> UNIQUE PLAYERS
                </div>
                <div className="mt-1 text-2xl font-semibold text-white">{loading ? '—' : stats.uniquePlayers}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-slate-300 text-xs">
                  <CalendarDays className="h-4 w-4" /> LATEST DATA
                </div>
                <div className="mt-1 text-lg font-semibold text-white">{loading ? '—' : (lastTournament.data || '—')}</div>
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-slate-300 text-xs">
                  <Activity className="h-4 w-4" /> Active players (7d)
                </div>
                <div className="mt-1 text-2xl font-semibold text-white">{loading ? '—' : matchStats.active7}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-slate-300 text-xs">
                  <Activity className="h-4 w-4" /> Active players (30d)
                </div>
                <div className="mt-1 text-2xl font-semibold text-white">{loading ? '—' : matchStats.active30}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-slate-300 text-xs">
                  <Users className="h-4 w-4" /> New players (30d)
                </div>
                <div className="mt-1 text-2xl font-semibold text-white">{loading ? '—' : matchStats.newPlayers30}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-slate-300 text-xs">
                  <Gauge className="h-4 w-4" /> Matches / day
                </div>
                <div className="mt-1 text-2xl font-semibold text-white">{loading ? '—' : matchStats.matchesPerDay.toFixed(1)}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-slate-300 text-xs">
                  <Gauge className="h-4 w-4" /> Matches / week
                </div>
                <div className="mt-1 text-2xl font-semibold text-white">{loading ? '—' : matchStats.matchesPerWeek.toFixed(1)}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 lg:col-span-2">
                <div className="flex items-center gap-2 text-slate-300 text-xs">
                  <Zap className="h-4 w-4" /> Avg ΔELO / match
                </div>
                <div className="mt-1 text-2xl font-semibold text-white">{loading ? '—' : matchStats.avgAbsDelta.toFixed(1)}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 lg:col-span-3">
                <div className="flex items-center gap-2 text-slate-300 text-xs">
                  <Trophy className="h-4 w-4" /> Upset %
                </div>
                <div className="mt-1 flex items-baseline justify-between">
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

          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">{'Aktivní hráči podle měsíce'}</div>
                <div className="text-xs text-slate-400">{mode.toUpperCase()}</div>
              </div>
              <div className="mt-4 h-56">
                {loading ? (
                  <Skeleton className="h-full w-full rounded-2xl" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyActiveSeries} margin={{ left: 4, right: 6, top: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgb(99 102 241 / 0.55)" />
                          <stop offset="100%" stopColor="rgb(99 102 241 / 0)" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: 'rgba(226,232,240,0.7)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(226,232,240,0.55)', fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
                      <Tooltip content={<GlassTooltip />} />
                      <Area type="monotone" dataKey="players" stroke="rgba(129,140,248,0.9)" fill="url(#grad)" isAnimationActive animationDuration={900} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="mt-4 text-xs text-slate-400 leading-relaxed">
                {t('hero_chart_hint') ||
                  'Otevři profil hráče a uvidíš detailní graf s vývojem ratingu, filtrováním turnajů a delta bar chart.'}
              </div>
            </div>

            
            <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">Zajímavé zápasy</div>
                <div className="text-xs text-slate-400">poslední týdny</div>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
                <div className="grid grid-cols-12 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200">
                  <div className="col-span-5">Zápas</div>
                  <div className="col-span-3 text-right">ELO</div>
                  <div className="col-span-4 text-right">Datum / turnaj</div>
                </div>

                {/* Nejvyšší součet ELO */}
                <div className="px-3 py-2 text-[11px] uppercase tracking-wide text-slate-400 bg-slate-950/40 border-t border-white/10">
                  Nejvyšší součet ELO (oba hráči co nejvýš)
                </div>
                {loading ? (
                  <div className="p-3 space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-9 w-full rounded-xl" />
                    ))}
                  </div>
                ) : (
                  (interestingMatches.topCombined.length ? interestingMatches.topCombined : []).map((m) => (
                    <div key={m.key} className="grid grid-cols-12 px-3 py-2 text-sm text-slate-200 hover:bg-white/5">
                      <div className="col-span-5 text-slate-300 truncate">{m.a} vs {m.b}</div>
                      <div className="col-span-3 text-right font-semibold text-white">{Math.round(m.eloA)} / {Math.round(m.eloB)}</div>
                      <div className="col-span-4 text-right text-slate-300 truncate">{m.dateStr} · {m.tournament || '—'}</div>
                    </div>
                  ))
                )}

                {/* Největší rozdíl ELO */}
                <div className="px-3 py-2 text-[11px] uppercase tracking-wide text-slate-400 bg-slate-950/40 border-t border-white/10">
                  Největší rozdíl ELO (největší mismatch)
                </div>
                {loading ? (
                  <div className="p-3 space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-9 w-full rounded-xl" />
                    ))}
                  </div>
                ) : (
                  (interestingMatches.topDiff.length ? interestingMatches.topDiff : []).map((m) => (
                    <div key={m.key} className="grid grid-cols-12 px-3 py-2 text-sm text-slate-200 hover:bg-white/5">
                      <div className="col-span-5 text-slate-300 truncate">{m.a} vs {m.b}</div>
                      <div className="col-span-3 text-right font-semibold text-white">{Math.round(m.eloA)} / {Math.round(m.eloB)}</div>
                      <div className="col-span-4 text-right text-slate-300 truncate">{m.dateStr} · {m.tournament || '—'}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-3 text-xs text-slate-400 leading-relaxed">
                Výběr je z posledních ~45 dní: nejvyšší součet ELO a největší rozdíl ELO.
              </div>
            </div>
            </div>
          </div>
        </div>

        <div className="mt-8 -mx-6 sm:-mx-10">
          <div className="px-6 sm:px-10">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Novinky & články</div>
              <div className="text-xs text-slate-400">Rychlé info ze scény</div>
            </div>
          </div>
          <div className="mt-4 max-w-[980px] mx-auto">
            <NewsCarousel
              items={[
                {
                  tag: 'Update',
                  image: '/assets/images/slider/carousel_cz_1.png',
                  title: 'Vylepšené grafy a rychlejší profil hráče',
                  date: lastTournament.data || '—',
                  excerpt: 'Nové metriky (upsety, aktivita), více grafů a přehlednější profil.',
                },
                {
                  tag: 'Insight',
                  image: '/assets/images/slider/carousel_cz_2.png',
                  title: 'Jak číst ELO: upsety a rozdíly ratingu',
                  date: 'Statistika',
                  excerpt: 'Graf “Winrate podle ELO rozdílu” ukáže, kdy favorit skutečně vyhrává.',
                },
                {
                  tag: 'Tip',
                  title: 'Filtruj období: 30/90/180 dní nebo all-life',
                  date: 'Profil',
                  excerpt: 'Každý hráč má přepínač období a zoom pro detailní průběh.',
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Distribution + Tips */}
      <section id="distribution" className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">{t('dist_title') || 'Rozložení ratingu'}</div>
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

        <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-soft">
          <div className="text-sm font-semibold text-white">{t('insights_title') || 'Insights'}</div>
          <div className="mt-1 text-xs text-slate-400">{t('insights_sub') || 'Rychlé zajímavosti pro aktuální režim'}</div>

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
                <BarChart data={matchStats.activityTable} margin={{ left: 6, right: 6, top: 10, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(226,232,240,0.6)', fontSize: 11 }} axisLine={false} tickLine={false} interval={Math.max(0, Math.floor(matchStats.activityTable.length / 6) - 1)} />
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
                <LineChart data={matchStats.winrateByDiff} margin={{ left: 6, right: 12, top: 10, bottom: 0 }}>
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
                      <ClassPill cls={classForRating(r.rating, classCuts.q25, classCuts.q50, classCuts.q75)} />
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
