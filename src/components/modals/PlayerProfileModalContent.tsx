
import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  Line,
  ComposedChart,
  Bar,
  Brush,
} from 'recharts'
import { ExternalLink, Filter, X } from 'lucide-react'
import { useI18n } from '../../features/i18n/i18n'
import { usePlayerCards, usePlayerSummary, type PlayerCard, type StandingsRow } from '../../features/elo/hooks'
import Segmented from '../ui/Segmented'
import Skeleton from '../ui/Skeleton'

function fmtDate(s: string) {
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return s
  return d.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function GlassTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const p0 = payload.find((p: any) => p.dataKey === 'elo') || payload[0]
  const p1 = payload.find((p: any) => p.dataKey === 'delta')
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

  const filteredCards = useMemo(() => {
    if (tournamentFilter === 'ALL') return playerCards
    return playerCards.filter((c) => c.tournament === tournamentFilter)
  }, [playerCards, tournamentFilter])

  const chartData = useMemo(() => {
    return filteredCards
      .filter((c) => Number.isFinite(c.matchId) && Number.isFinite(c.elo))
      .map((c) => ({
        x: c.matchId,
        label: `${fmtDate(c.date)} • ${c.tournament || ''}`.trim(),
        elo: c.elo,
        delta: parseDelta(c.delta),
        opponent: c.opponent,
        result: c.result,
        tournament: c.tournament,
      }))
  }, [filteredCards])

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
            onChange={(v) => setLocalMode(v as any)}
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
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-400">{t('profile_rating') || 'Aktuální rating'}</div>
          <div className="mt-1 text-2xl font-semibold text-white">{player.rating}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-400">{t('profile_peak') || 'Peak'}</div>
          <div className="mt-1 text-2xl font-semibold text-white">{player.peak}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-400">{t('profile_avg_opp') || 'Prům. soupeř'}</div>
          <div className="mt-1 text-2xl font-semibold text-white">{s ? Math.round(s.avgOpp) : '—'}</div>
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

      {/* Matches */}
      <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-white">{t('profile_matches') || 'Zápasy'}</div>
          <div className="text-xs text-slate-400">{tournamentFilter === 'ALL' ? (t('all') || 'Vše') : tournamentFilter}</div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-12 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200">
            <div className="col-span-2">{t('date') || 'Datum'}</div>
            <div className="col-span-3">{t('tournament') || 'Turnaj'}</div>
            <div className="col-span-3">{t('opponent') || 'Soupeř'}</div>
            <div className="col-span-2 text-right">{t('result') || 'Výsledek'}</div>
            <div className="col-span-2 text-right">Δ</div>
          </div>
          <div className="max-h-72 overflow-auto divide-y divide-white/5">
            {loading ? (
              <div className="p-3 space-y-2">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full rounded-xl" />
                ))}
              </div>
            ) : filteredCards.length ? (
              filteredCards
                .slice()
                .reverse()
                .map((c: PlayerCard) => (
                  <div key={c.matchId} className="grid grid-cols-12 px-3 py-2 text-sm text-slate-200 hover:bg-white/5">
                    <div className="col-span-2 text-slate-400">{fmtDate(c.date)}</div>
                    <div className="col-span-3 font-semibold">{c.tournament || '—'}</div>
                    <div className="col-span-3">{c.opponent}</div>
                    <div className="col-span-2 text-right">{c.result}</div>
                    <div className="col-span-2 text-right text-slate-300">{c.delta}</div>
                  </div>
                ))
            ) : (
              <div className="px-3 py-6 text-sm text-slate-400">{t('no_data') || 'Žádná data.'}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
