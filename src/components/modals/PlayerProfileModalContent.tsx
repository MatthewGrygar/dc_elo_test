
import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  Line,
  ComposedChart,
  Bar,
  Brush,
  BarChart,
  LineChart,
} from 'recharts'
import type { TooltipProps } from 'recharts'
import { ExternalLink, Filter, X } from 'lucide-react'
import { useI18n } from '../../features/i18n/i18n'
import { usePlayerCards, usePlayerSummary, type PlayerCard, type StandingsRow } from '../../features/elo/hooks'
import Segmented from '../ui/Segmented'
import Skeleton from '../ui/Skeleton'
import { parseOutcome } from '../../lib/outcome'

function fmtDate(s: string) {
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return s
  return d.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' })
}

type ChartPayloadEntry = { dataKey?: string; value?: number | string }

function GlassTooltip({ active, payload, label }: TooltipProps<number | string, string>) {
  if (!active || !payload?.length) return null
  const entries = payload as unknown as ChartPayloadEntry[]
  const p0 = entries.find((p) => p.dataKey === 'elo') || entries[0]
  const p1 = entries.find((p) => p.dataKey === 'delta')
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm shadow-soft backdrop-blur">
      <div className="text-slate-200 font-semibold">{label}</div>
      <div className="mt-1 space-y-1 text-slate-300">
        <div>
          <span className="text-slate-400 mr-2">Rating</span>
          <span className="font-semibold text-slate-100">{p0?.value}</span>
        </div>
        {p1 ? (
          <div>
            <span className="text-slate-400 mr-2">Δ</span>
            <span className="font-semibold text-slate-100">{p1.value}</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function parseDelta(s: string) {
  const v = Number(String(s ?? '').replace(',', '.'))
  return Number.isFinite(v) ? v : 0
}

function parseWinrateText(winrateText: string) {
  const s = (winrateText || '').toString().trim()
  if (!s) return Number.NaN
  if (s.includes('%')) {
    const n = Number(s.replace('%', '').trim())
    return Number.isFinite(n) ? n : Number.NaN
  }
  const n = Number(s)
  return Number.isFinite(n) ? n : Number.NaN
}

type Period = 'ALL' | '30D' | '90D' | '180D' | '365D'

function periodCutoff(p: Period) {
  const now = new Date()
  if (p === 'ALL') return null
    const days = p === '30D' ? 30 : p === '90D' ? 90 : p === '180D' ? 180 : 365
  const d = new Date(now)
  d.setDate(d.getDate() - days)
  return d
}

export default function PlayerProfileModalContent({
  player,
  mode,
  onClose,
}: {
  player: StandingsRow
  mode: 'elo' | 'dcpr'
  onClose: () => void
}) {
  const { t } = useI18n()

  const [localMode, setLocalMode] = useState<'elo' | 'dcpr'>(mode)
  const cards = usePlayerCards(localMode)
  const summary = usePlayerSummary(localMode)

  const playerCards = useMemo(() => {
    const all = cards.data ?? []
    return all.filter((c) => c.player.trim() === player.player.trim()).sort((a, b) => a.matchId - b.matchId)
  }, [cards.data, player.player])

  const enrichedMatches = useMemo(() => {
    const all = cards.data ?? []
    const byMatch = new Map<number, PlayerCard[]>()
    for (const c of all) {
      if (!Number.isFinite(c.matchId)) continue
      const arr = byMatch.get(c.matchId) ?? []
      arr.push(c)
      byMatch.set(c.matchId, arr)
    }

    const list: {
      matchId: number
      date: string
      tournament: string
      opponent: string
      outcome: 'W' | 'L' | 'D' | 'U'
      delta: number
      eloAfter: number
      eloBefore: number
      oppEloBefore: number | null
      oppEloAfter: number | null
      isUnderdog: boolean | null
      isUpsetWin: boolean
    }[] = []

    for (const [matchId, group] of byMatch.entries()) {
      const me = group.find((g) => g.player.trim() === player.player.trim())
      if (!me) continue
      const opp = group.find((g) => g.player.trim() !== player.player.trim()) || null

      const delta = parseDelta(me.delta)
      const eloAfter = me.elo
      const eloBefore = eloAfter - delta

      const outcome = parseOutcome(me.result)
      const oppDelta = opp ? parseDelta(opp.delta) : 0
      const oppEloAfter = opp ? opp.elo : null
      const oppEloBefore = opp ? opp.elo - oppDelta : null

      const isUnderdog = oppEloBefore !== null ? eloBefore < oppEloBefore : null
      const isUpsetWin = outcome === 'W' && isUnderdog === true

      list.push({
        matchId,
        date: me.date,
        tournament: me.tournament,
        opponent: me.opponent,
        outcome,
        delta,
        eloAfter,
        eloBefore,
        oppEloBefore,
        oppEloAfter,
        isUnderdog,
        isUpsetWin,
      })
    }

    return list.sort((a, b) => a.matchId - b.matchId)
  }, [cards.data, player.player])



  const s = useMemo(() => {
    const all = summary.data ?? []
    return all.find((x) => x.player.trim() === player.player.trim()) || null
  }, [summary.data, player.player])

  const tournaments = useMemo(() => {
    const set = new Set<string>()
    for (const c of playerCards) {
      if (c.tournament) set.add(c.tournament)
    }
    return ['ALL', ...Array.from(set).sort((a, b) => a.localeCompare(b))]
  }, [playerCards])

  const [tournamentFilter, setTournamentFilter] = useState('ALL')
  const [period, setPeriod] = useState<Period>('ALL')

  const filteredCards = useMemo(() => {
    let list = playerCards
    if (tournamentFilter !== 'ALL') list = list.filter((c) => c.tournament === tournamentFilter)
    const cutoff = periodCutoff(period)
    if (cutoff) {
      list = list.filter((c) => {
        const d = new Date(c.date)
        return !Number.isNaN(d.getTime()) && d >= cutoff
      })
    }
    return list
  }, [playerCards, tournamentFilter, period])

  const filteredEnriched = useMemo(() => {
    let list = enrichedMatches
    if (tournamentFilter !== 'ALL') list = list.filter((c) => c.tournament === tournamentFilter)
    const cutoff = periodCutoff(period)
    if (cutoff) {
      list = list.filter((c) => {
        const d = new Date(c.date)
        return !Number.isNaN(d.getTime()) && d >= cutoff
      })
    }
    return list
  }, [enrichedMatches, tournamentFilter, period])


  const chartData = useMemo(() => {
    return filteredCards
      .filter((c) => Number.isFinite(c.matchId) && Number.isFinite(c.elo))
      .map((c) => {
        const d = new Date(c.date)
        const time = Number.isNaN(d.getTime()) ? c.matchId : d.getTime()
        return {
          x: time,
          label: `${fmtDate(c.date)} • ${c.tournament || ''}`.trim(),
          elo: c.elo,
          delta: parseDelta(c.delta),
          opponent: c.opponent,
          result: c.result,
          tournament: c.tournament,
          date: c.date,
        }
      })
      .sort((a, b) => a.x - b.x)
  }, [filteredCards])

  const winrateSeries = useMemo(() => {
    const list = filteredEnriched
    const window = 10
    // Explicit number typing keeps TS happy (otherwise literals infer as 0|0.5|1 and break predicates/reduce).
    const outToNum = (o: string): number | null => (o === 'W' ? 1 : o === 'L' ? 0 : o === 'D' ? 0.5 : null)
    const series: { x: number; label: string; winrate: number }[] = []
    for (let i = 0; i < list.length; i++) {
      const slice = list.slice(Math.max(0, i - window + 1), i + 1)
      const nums = slice.map((m) => outToNum(m.outcome)).filter((v): v is number => v !== null)
      if (!nums.length) continue
      const wr = (nums.reduce((a, b) => a + b, 0) / nums.length) * 100
      const d = new Date(list[i].date)
      const x = Number.isNaN(d.getTime()) ? list[i].matchId : d.getTime()
      series.push({ x, label: fmtDate(list[i].date), winrate: wr })
    }
    return series
  }, [filteredEnriched])

  const deltaDistribution = useMemo(() => {
    const list = filteredEnriched
    const step = 5
    const deltas = list.map((m) => m.delta).filter((n) => Number.isFinite(n))
    if (!deltas.length) return []
    const min = Math.floor(Math.min(...deltas) / step) * step
    const max = Math.ceil(Math.max(...deltas) / step) * step
    const bins: { bucket: string; from: number; to: number; count: number }[] = []
    for (let a = min; a < max; a += step) bins.push({ bucket: `${a}..${a + step}`, from: a, to: a + step, count: 0 })
    for (const d of deltas) {
      const idx = Math.min(bins.length - 1, Math.max(0, Math.floor((d - min) / step)))
      bins[idx].count += 1
    }
    return bins
  }, [filteredEnriched])

  const winrateVsDiffData = useMemo(() => {
    // Winrate vs ELO difference (před zápasem): zobrazujeme VŠECHNY buckety + expected křivku.
    // Spolehlivost indikujeme stylem podle n (>=30 / 10-29 / <10) + volitelný Wilson CI pás.

    const minX = -500
    const maxX = 500
    const step = 50

    const expected = (d: number) => 1 / (1 + Math.pow(10, -d / 400))

    const outToPoints = (o: string) => (o === 'W' ? 1 : o === 'L' ? 0 : o === 'D' ? 0.5 : null)

    type BucketAgg = {
      from: number
      to: number
      center: number
      n: number
      wins: number
      losses: number
      draws: number
      sum: number
    }

    const buckets: BucketAgg[] = []
    for (let a = minX; a < maxX; a += step) {
      buckets.push({ from: a, to: a + step, center: a + step / 2, n: 0, wins: 0, losses: 0, draws: 0, sum: 0 })
    }

    for (const m of filteredEnriched) {
      if (m.oppEloBefore === null) continue
      const diff = m.eloBefore - m.oppEloBefore
      if (!Number.isFinite(diff)) continue
      if (diff < minX || diff > maxX) continue
      const pts = outToPoints(m.outcome)
      if (pts === null) continue

      const idx = Math.min(buckets.length - 1, Math.max(0, Math.floor((diff - minX) / step)))
      const b = buckets[idx]
      b.n += 1
      b.sum += pts
      if (m.outcome === 'W') b.wins += 1
      else if (m.outcome === 'L') b.losses += 1
      else if (m.outcome === 'D') b.draws += 1
    }

    // Wilson interval (binomial) – pro D bereme 0.5 bodu, ber to jako aproximaci.
    const wilson = (p: number, n: number, z = 1.96) => {
      if (n <= 0) return { lo: 0, hi: 1 }
      const z2 = z * z
      const denom = 1 + z2 / n
      const center = (p + z2 / (2 * n)) / denom
      const half = (z * Math.sqrt((p * (1 - p) + z2 / (4 * n)) / n)) / denom
      return { lo: Math.max(0, center - half), hi: Math.min(1, center + half) }
    }

    // Expected křivka (hladká): dense step
    const denseStep = 10
    type WinrateDiffPoint = {
      diff: number
      expected: number
      empirical?: number | null
      empiricalStrong?: number | null
      empiricalMid?: number | null
      empiricalLow?: number | null
      n?: number
      wins?: number
      losses?: number
      draws?: number
      ciLower?: number
      ciUpper?: number
      ciBand?: number
    }

    const byDiff = new Map<number, WinrateDiffPoint>()
    for (let d = minX; d <= maxX; d += denseStep) {
      byDiff.set(d, { diff: d, expected: expected(d) })
    }

    // Empirické body na středech bucketů (bez filtrování)
    for (const b of buckets) {
      if (b.n === 0) {
        // i prázdné buckety necháme bez empirických hodnot
        const key = b.center
        if (!byDiff.has(key)) byDiff.set(key, { diff: key, expected: expected(key) })
        continue
      }
      const p = b.sum / b.n
      const { lo, hi } = wilson(p, b.n)
      const key = b.center
      const row: WinrateDiffPoint = byDiff.get(key) || { diff: key, expected: expected(key) }

      // styl podle n
      const strong = b.n >= 30
      const mid = b.n >= 10 && b.n < 30
      const low = b.n < 10

      row.empiricalStrong = strong ? p : null
      row.empiricalMid = mid ? p : null
      row.empiricalLow = low ? p : null
      row.empirical = p
      row.n = b.n
      row.wins = b.wins
      row.losses = b.losses
      row.draws = b.draws

      // CI band
      row.ciLower = lo
      row.ciUpper = hi
      row.ciBand = hi - lo

      byDiff.set(key, row)
    }

    const out = Array.from(byDiff.values()).sort((a, b) => a.diff - b.diff)
    return out
  }, [filteredEnriched])


  const winrateNum = useMemo(() => {
    const n = parseWinrateText(player.winrate)
    return Number.isFinite(n) ? n : null
  }, [player.winrate])

  const metrics = useMemo(() => {
    const list = enrichedMatches
    if (!list.length) {
      return {
        minElo: null,
        avgDeltaAbs: null,
        avgDeltaSigned: null,
        avgOpp: s ? Math.round(s.avgOpp) : null,
        maxDefeated: null,
        maxLostTo: null,
        elo7: null,
        elo30: null,
        games7: 0,
        stability: null,
        momentum20: null,
        clutch: null,
        upsetRate: null,
        mostOpponent: null,
        bestBeaten: null,
        bestThatBeatYou: null,
      }
    }

    const minElo = Math.min(...list.map((x) => x.eloAfter).filter((n) => Number.isFinite(n)))
    const deltas = list.map((x) => x.delta)
    const avgDeltaSigned = deltas.reduce((a, b) => a + b, 0) / deltas.length
    const avgDeltaAbs = deltas.reduce((a, b) => a + Math.abs(b), 0) / deltas.length

    const opps = list.map((x) => x.oppEloBefore).filter((n): n is number => n !== null && Number.isFinite(n))
    const avgOpp = opps.length ? Math.round(opps.reduce((a, b) => a + b, 0) / opps.length) : (s ? Math.round(s.avgOpp) : null)

    // Highest defeated / that beat you (based on opp pre-rating)
    let bestBeaten = -Infinity
    let bestThatBeatYou = -Infinity
    for (const m of list) {
      if (m.oppEloBefore === null) continue
      if (m.outcome === 'W') bestBeaten = Math.max(bestBeaten, m.oppEloBefore)
      if (m.outcome === 'L') bestThatBeatYou = Math.max(bestThatBeatYou, m.oppEloBefore)
    }

    // Peak already from standings; but we compute maxDefeated etc.
    const maxDefeated = bestBeaten === -Infinity ? null : Math.round(bestBeaten)
    const maxLostTo = bestThatBeatYou === -Infinity ? null : Math.round(bestThatBeatYou)

    // ELO change 7/30 days: compare latest eloAfter to eloBefore at cutoff
    const now = new Date()
    const cutoff7 = new Date(now); cutoff7.setDate(cutoff7.getDate() - 7)
    const cutoff30 = new Date(now); cutoff30.setDate(cutoff30.getDate() - 30)

    const latest = list[list.length - 1]
    const atOrBefore = (cutoff: Date) => {
      const eligible = list.filter((m) => {
        const d = new Date(m.date)
        return !Number.isNaN(d.getTime()) && d <= cutoff
      })
      return eligible.length ? eligible[eligible.length - 1] : null
    }

    const before7 = atOrBefore(cutoff7)
    const before30 = atOrBefore(cutoff30)
    const elo7 = before7 ? latest.eloAfter - before7.eloAfter : null
    const elo30 = before30 ? latest.eloAfter - before30.eloAfter : null

    const games7 = list.filter((m) => {
      const d = new Date(m.date)
      return !Number.isNaN(d.getTime()) && d >= cutoff7
    }).length

    // Stability index: scaled stdev of deltas (0-100)
    const mean = avgDeltaSigned
    const variance = deltas.reduce((acc, v) => acc + (v - mean) * (v - mean), 0) / deltas.length
    const stdev = Math.sqrt(variance)
    const stability = Math.max(0, Math.min(100, 100 - stdev * 6)) // heuristic

    // Momentum: avg delta last 20 games scaled to 0-100
    const last20 = list.slice(-20)
    const mom = last20.length ? last20.reduce((a, b) => a + b.delta, 0) / last20.length : 0
    const momentum20 = Math.max(0, Math.min(100, 50 + mom * 5)) // heuristic

    // Clutch: winrate as underdog (vs stronger)
    const underdogGames = list.filter((m) => m.isUnderdog === true && (m.outcome === 'W' || m.outcome === 'L'))
    const clutch = underdogGames.length ? (underdogGames.filter((m) => m.outcome === 'W').length / underdogGames.length) * 100 : null
    const upsetRate = underdogGames.length ? clutch : null

    // Most frequent opponent
    const freq = new Map<string, number>()
    for (const m of list) freq.set(m.opponent, (freq.get(m.opponent) ?? 0) + 1)
    const mostOpponent = Array.from(freq.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

    return {
      minElo: Number.isFinite(minElo) ? Math.round(minElo) : null,
      avgDeltaAbs: Number.isFinite(avgDeltaAbs) ? avgDeltaAbs : null,
      avgDeltaSigned: Number.isFinite(avgDeltaSigned) ? avgDeltaSigned : null,
      avgOpp,
      maxDefeated,
      maxLostTo,
      elo7,
      elo30,
      games7,
      stability,
      momentum20,
      clutch,
      upsetRate,
      mostOpponent,
      bestBeaten: maxDefeated,
      bestThatBeatYou: maxLostTo,
    }
  }, [enrichedMatches, s])



  const loading = cards.isLoading || summary.isLoading

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-2xl font-semibold tracking-tight text-white">{player.player}</div>
          <div className="text-sm text-slate-400">
            {t('profile_sub') || 'Detail hráče'} • <span className="text-slate-200 font-semibold">{localMode.toUpperCase()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Segmented
            value={localMode}
            onChange={(v) => setLocalMode(v === 'elo' || v === 'dcpr' ? v : 'elo')}
            options={[
              { value: 'elo', label: 'ELO' },
              { value: 'dcpr', label: 'DCPR' },
            ]}
          />
          <button
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
            aria-label="close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-400">Aktuální ELO</div>
          <div className="mt-1 text-2xl font-semibold text-white">{player.rating}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-400">Peak</div>
          <div className="mt-1 text-2xl font-semibold text-white">{player.peak}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-400">Nejnižší ELO</div>
          <div className="mt-1 text-2xl font-semibold text-white">{metrics.minElo ?? '—'}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-400">Počet her</div>
          <div className="mt-1 text-2xl font-semibold text-white">{player.games}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-400">Winrate</div>
          <div className="mt-1 text-2xl font-semibold text-white">{winrateNum !== null ? `${winrateNum}%` : player.winrate || '—'}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-400">Výhry / prohry / remízy</div>
          <div className="mt-1 text-2xl font-semibold text-white">
            {player.win} / {player.loss} / {player.draw}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-400">Prům. ΔELO / zápas</div>
          <div className="mt-1 text-2xl font-semibold text-white">{metrics.avgDeltaAbs !== null ? metrics.avgDeltaAbs.toFixed(1) : '—'}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-400">Nejdelší win streak</div>
          <div className="mt-1 text-2xl font-semibold text-white">{s ? s.winStreak : '—'}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-400">Nejdelší lose streak</div>
          <div className="mt-1 text-2xl font-semibold text-white">{s ? s.lossStreak : '—'}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-400">Průměrné ELO soupeřů</div>
          <div className="mt-1 text-2xl font-semibold text-white">{metrics.avgOpp ?? '—'}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-400">Nejvyšší poražené ELO</div>
          <div className="mt-1 text-2xl font-semibold text-white">{metrics.bestBeaten ?? '—'}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-400">Nejvyšší ELO, co tě porazilo</div>
          <div className="mt-1 text-2xl font-semibold text-white">{metrics.bestThatBeatYou ?? '—'}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-400">ELO změna (7 dní)</div>
          <div className="mt-1 text-2xl font-semibold text-white">{metrics.elo7 !== null ? (metrics.elo7 >= 0 ? `+${metrics.elo7}` : `${metrics.elo7}`) : '—'}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-400">ELO změna (30 dní)</div>
          <div className="mt-1 text-2xl font-semibold text-white">{metrics.elo30 !== null ? (metrics.elo30 >= 0 ? `+${metrics.elo30}` : `${metrics.elo30}`) : '—'}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-400">Her za týden</div>
          <div className="mt-1 text-2xl font-semibold text-white">{metrics.games7}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 xl:col-span-2">
          <div className="text-xs text-slate-400">Indexy</div>
          <div className="mt-2 grid gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Stability</span>
              <span className="text-slate-100 font-semibold">{metrics.stability !== null ? Math.round(metrics.stability) : '—'}</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div className="h-2 bg-white/20" style={{ width: `${metrics.stability ?? 0}%` }} />
            </div>

            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-slate-300">Momentum (20 her)</span>
              <span className="text-slate-100 font-semibold">{metrics.momentum20 !== null ? Math.round(metrics.momentum20) : '—'}</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div className="h-2 bg-white/20" style={{ width: `${metrics.momentum20 ?? 0}%` }} />
            </div>

            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-slate-300">Clutch / Upset rate</span>
              <span className="text-slate-100 font-semibold">{metrics.clutch !== null ? `${metrics.clutch.toFixed(1)}%` : '—'}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 xl:col-span-3">
          <div className="text-xs text-slate-400">Nejčastější soupeř</div>
          <div className="mt-1 text-2xl font-semibold text-white">{metrics.mostOpponent ?? '—'}</div>
          <div className="mt-1 text-xs text-slate-400">Upset rate: {metrics.upsetRate !== null ? `${metrics.upsetRate.toFixed(1)}%` : '—'}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
          <Filter className="h-4 w-4 text-slate-300" />
          <span className="text-slate-400">{t('profile_filter') || 'Turnaj:'}</span>
          <select
            value={tournamentFilter}
            onChange={(e) => setTournamentFilter(e.target.value)}
            className="bg-transparent text-slate-100 outline-none"
          >
            {tournaments.map((x) => (
              <option key={x} value={x} className="bg-slate-950">
                {x === 'ALL' ? (t('all') || 'Vše') : x}
              </option>
            ))}
          </select>
        </div>

        <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-2 py-1.5">
          <span className="px-2 text-sm text-slate-400">Období</span>
          <Segmented
            value={period}
            onChange={(v) => setPeriod(v as Period)}
            options={[
              { value: 'ALL', label: 'All' },
              { value: '30D', label: '30d' },
              { value: '90D', label: '90d' },
              { value: '180D', label: '180d' },
              { value: '365D', label: '1y' },
              ]}
          />
        </div>

        <a
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
          href="https://docs.google.com/spreadsheets/d/1Y0kSHYcYqfT-qqiDPtnd-KhOVd5wG2QW9nyx2Y0oT3o/edit"
          target="_blank"
          rel="noreferrer"
        >
          <ExternalLink className="h-4 w-4" />
          {t('open_sheet') || 'Otevřít sheet'}
        </a>
      </div>

      {/* Chart */}
      <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-white">{t('profile_chart') || 'Vývoj ratingu'}</div>
          <div className="text-xs text-slate-400">{chartData.length ? `${chartData.length} zápasů` : '—'}</div>
        </div>

        <div className="mt-4 h-72">
          {loading ? (
            <Skeleton className="h-full w-full rounded-2xl" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ left: 6, right: 12, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="ratingFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(99 102 241 / 0.50)" />
                    <stop offset="100%" stopColor="rgb(99 102 241 / 0)" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="x"
                  tick={{ fill: 'rgba(226,232,240,0.6)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => {
                    const d = new Date(Number(v))
                    return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' })
                  }}
                />
                <YAxis
                  tick={{ fill: 'rgba(226,232,240,0.55)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip content={<GlassTooltip />} />
                <Area type="monotone" dataKey="elo" stroke="rgba(129,140,248,0.9)" fill="url(#ratingFill)" isAnimationActive animationDuration={900} />
                <Line type="monotone" dataKey="elo" stroke="rgba(224,231,255,0.85)" dot={false} isAnimationActive animationDuration={900} />
                <Bar dataKey="delta" barSize={10} fill="rgba(34,211,238,0.35)" isAnimationActive animationDuration={900} />
                <Brush dataKey="x" height={18} stroke="rgba(99,102,241,0.9)" travellerWidth={10} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="mt-3 text-xs text-slate-400">
          {t('profile_chart_hint') || 'Tip: přetáhni spodní lištu pro zoom do části sezóny.'}
        </div>
      </div>


      {/* Extra charts */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-6 rounded-3xl border border-white/10 bg-slate-950/40 p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-white">Winrate v čase</div>
            <div className="text-xs text-slate-400">rolling (10 zápasů)</div>
          </div>
          <div className="mt-4 h-56">
            {loading ? (
              <Skeleton className="h-full w-full rounded-2xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={winrateSeries} margin={{ left: 6, right: 12, top: 10, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="x"
                    tick={{ fill: 'rgba(226,232,240,0.6)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => {
                      const d = new Date(Number(v))
                      return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' })
                    }}
                  />
                  <YAxis tick={{ fill: 'rgba(226,232,240,0.55)', fontSize: 12 }} axisLine={false} tickLine={false} width={40} domain={[0, 100]} />
                  <Tooltip content={<GlassTooltip />} />
                  <Line type="monotone" dataKey="winrate" stroke="rgba(34,211,238,0.9)" dot={false} isAnimationActive animationDuration={900} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="lg:col-span-6 rounded-3xl border border-white/10 bg-slate-950/40 p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-white">Distribuce ELO změn</div>
            <div className="text-xs text-slate-400">kolik zápasů bylo v pásmu Δ</div>
          </div>
          <div className="mt-4 h-56">
            {loading ? (
              <Skeleton className="h-full w-full rounded-2xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deltaDistribution} margin={{ left: 6, right: 6, top: 10, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="bucket" tick={{ fill: 'rgba(226,232,240,0.6)', fontSize: 11 }} axisLine={false} tickLine={false} interval={Math.max(0, Math.floor(deltaDistribution.length / 8) - 1)} />
                  <YAxis tick={{ fill: 'rgba(226,232,240,0.55)', fontSize: 12 }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip content={<GlassTooltip />} />
                  <Bar dataKey="count" radius={[10, 10, 0, 0]} fill="rgba(99,102,241,0.55)" isAnimationActive animationDuration={900} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="lg:col-span-12 rounded-3xl border border-white/10 bg-slate-950/40 p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-white">Winrate vs ELO Difference</div>
            <div className="text-xs text-slate-400">Empirická winrate vs expected křivka (ELO)</div>
          </div>
          <div className="mt-4 h-72">
            {loading ? (
              <Skeleton className="h-full w-full rounded-2xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={winrateVsDiffData} margin={{ left: 6, right: 12, top: 10, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="diff"
                    type="number"
                    domain={[-500, 500]}
                    tick={{ fill: 'rgba(226,232,240,0.6)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}`}
                  />
                  <YAxis
                    tick={{ fill: 'rgba(226,232,240,0.6)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={46}
                    domain={[0, 1]}
                    tickFormatter={(v) => `${Math.round(Number(v) * 100)}%`}
                  />
                  <Tooltip
                    content={(props: TooltipProps<number | string, string>) => {
                      const { active, payload } = props
                      if (!active || !payload?.length) return null
                      const p = (payload[0] as unknown as { payload?: unknown })?.payload as
                        | {
                            diff?: number
                            empirical?: number
                            expected?: number
                            n?: number
                            wins?: number
                            losses?: number
                            draws?: number
                          }
                        | undefined
                      if (!p) return null
                      const emp = typeof p.empirical === 'number' ? `${Math.round(p.empirical * 100)}%` : '—'
                      const exp = typeof p.expected === 'number' ? `${Math.round(p.expected * 100)}%` : '—'
                      const n = typeof p.n === 'number' ? p.n : null
                      const w = typeof p.wins === 'number' ? p.wins : null
                      const l = typeof p.losses === 'number' ? p.losses : null
                      const d = typeof p.draws === 'number' ? p.draws : null
                      return (
                        <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm shadow-soft backdrop-blur">
                          <div className="text-slate-200 font-semibold">ΔELO: {p.diff}</div>
                          <div className="mt-1 text-slate-300">
                            Empirical: <span className="text-slate-100 font-semibold">{emp}</span>
                            {n !== null ? <span className="text-slate-400"> • n={n}</span> : null}
                          </div>
                          {n !== null ? (
                            <div className="text-slate-400 text-xs">
                              W:{w ?? 0} • L:{l ?? 0} • D:{d ?? 0}
                            </div>
                          ) : null}
                          <div className="text-slate-300">
                            Expected: <span className="text-slate-100 font-semibold">{exp}</span>
                          </div>
                        </div>
                      )
                    }}
                  />

                  {/* Wilson CI band (aproximace) */}
                  <Area type="monotone" dataKey="ciLower" stackId="ci" stroke="none" fill="rgba(0,0,0,0)" isAnimationActive={false} />
                  <Area
                    type="monotone"
                    dataKey="ciBand"
                    stackId="ci"
                    stroke="none"
                    fill="rgba(251,191,36,0.10)"
                    isAnimationActive
                    animationDuration={700}
                  />

                  {/* Expected křivka */}
                  <Line
                    type="monotone"
                    dataKey="expected"
                    stroke="rgba(34,211,238,0.9)"
                    dot={false}
                    isAnimationActive
                    animationDuration={900}
                  />

                  {/* Empirická winrate (všechny buckety) – styl podle n */}
                  <Line
                    type="monotone"
                    dataKey="empiricalStrong"
                    stroke="rgba(251,191,36,0.95)"
                    dot={{ r: 3 }}
                    connectNulls={false}
                    isAnimationActive
                    animationDuration={900}
                  />
                  <Line
                    type="monotone"
                    dataKey="empiricalMid"
                    stroke="rgba(251,191,36,0.65)"
                    dot={{ r: 3 }}
                    connectNulls={false}
                    isAnimationActive
                    animationDuration={900}
                  />
                  <Line
                    type="monotone"
                    dataKey="empiricalLow"
                    stroke="rgba(251,191,36,0.30)"
                    strokeDasharray="4 4"
                    dot={{ r: 3 }}
                    connectNulls={false}
                    isAnimationActive
                    animationDuration={900}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Buckety: −500..+500 (step 50). Empirická křivka zobrazuje všechny buckety; spolehlivost naznačuje styl (n≥30 / 10–29 / méně než 10) a jemný CI pás. Expected: 1 / (1 + 10^(−Δ/400)).
          </div>
        </div>
    </div>
  </div>
  )
}
