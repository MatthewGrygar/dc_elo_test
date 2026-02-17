import { useMemo, useState } from 'react'
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { ExternalLink, Filter, X } from 'lucide-react'
import { useI18n } from '../../features/i18n/i18n'
import {
  usePlayerCards,
  usePlayerSummary,
  type PlayerCard,
  type StandingsRow,
} from '../../features/elo/hooks'

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

  const chartData = useMemo(() => {
    return playerCards
      .filter((c) => Number.isFinite(c.matchId) && Number.isFinite(c.elo))
      .map((c) => ({ matchId: c.matchId, elo: c.elo }))
  }, [playerCards])

  const tournaments = useMemo(() => {
    const set = new Set<string>()
    for (const c of playerCards) {
      if (c.tournament) set.add(c.tournament)
    }
    return Array.from(set).sort()
  }, [playerCards])

  const [tFilter, setTFilter] = useState<string>('')

  const filteredCards = useMemo(() => {
    if (!tFilter) return playerCards
    return playerCards.filter((c) => c.tournament === tFilter)
  }, [playerCards, tFilter])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 lg:flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-indigo-500/15 px-2.5 py-1 text-xs font-semibold text-indigo-200">
              {localMode === 'dcpr' ? 'DCPR' : 'ELO'}
            </span>
            <span className="text-sm text-slate-300">#{player.rank}</span>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Stat label={t('th_rating')} value={Number.isFinite(player.rating) ? player.rating.toFixed(0) : '—'} />
            <Stat label={t('th_peak')} value={Number.isFinite(player.peak) ? player.peak.toFixed(0) : '—'} />
            <Stat label={t('th_games')} value={Number.isFinite(player.games) ? player.games.toFixed(0) : '—'} />
            <Stat label={t('th_winrate')} value={player.winrate || '—'} />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Chip label={t('th_win')} value={Number.isFinite(player.win) ? player.win.toFixed(0) : '—'} />
            <Chip label={t('th_loss')} value={Number.isFinite(player.loss) ? player.loss.toFixed(0) : '—'} />
            <Chip label={t('th_draw')} value={Number.isFinite(player.draw) ? player.draw.toFixed(0) : '—'} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              className={
                localMode === 'elo'
                  ? 'rounded-2xl bg-indigo-500 px-3 py-2 text-sm font-semibold text-white'
                  : 'rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10'
              }
              onClick={() => setLocalMode('elo')}
              type="button"
            >
              ELO
            </button>
            <button
              className={
                localMode === 'dcpr'
                  ? 'rounded-2xl bg-indigo-500 px-3 py-2 text-sm font-semibold text-white'
                  : 'rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10'
              }
              onClick={() => setLocalMode('dcpr')}
              type="button"
            >
              DCPR
            </button>

            <button
              className="ml-auto inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
              onClick={onClose}
              type="button"
            >
              <X className="h-4 w-4" />
              {t('close')}
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 lg:w-[360px]">
          <div className="text-sm font-semibold">{t('player_overview')}</div>
          <div className="mt-3 space-y-2 text-sm text-slate-300">
            <Row label="Avg opp" value={s && Number.isFinite(s.avgOpp) ? s.avgOpp.toFixed(0) : '—'} />
            <Row label="Win streak" value={s && Number.isFinite(s.winStreak) ? s.winStreak.toFixed(0) : '—'} />
            <Row label="Loss streak" value={s && Number.isFinite(s.lossStreak) ? s.lossStreak.toFixed(0) : '—'} />
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-xs text-slate-400">
            Tip: filtrování turnajů + graf vývoje jsou generované z <span className="font-semibold">Player cards</span>
            listu.
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold">{t('player_chart')}</div>
            <span className="text-xs text-slate-400">matchId → elo</span>
          </div>

          <div className="mt-3 h-64 rounded-2xl border border-white/10 bg-slate-950/60 p-3">
            {cards.isLoading ? (
              <div className="grid h-full place-items-center text-sm text-slate-300">Loading…</div>
            ) : chartData.length < 2 ? (
              <div className="grid h-full place-items-center text-sm text-slate-300">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <XAxis dataKey="matchId" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="elo" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-semibold">{t('player_matches')}</div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm"
                value={tFilter}
                onChange={(e) => setTFilter(e.target.value)}
              >
                <option value="">All tournaments</option>
                {tournaments.map((x) => (
                  <option value={x} key={x}>
                    {x}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
            <div className="max-h-[20rem] overflow-auto">
              {cards.isLoading ? (
                <div className="p-4 text-sm text-slate-300">Loading…</div>
              ) : !filteredCards.length ? (
                <div className="p-4 text-sm text-slate-300">No matches.</div>
              ) : (
                <ul className="divide-y divide-white/10">
                  {filteredCards.slice().reverse().slice(0, 120).map((c) => (
                    <li key={`${c.matchId}-${c.opponent}-${c.date}`} className="p-3 hover:bg-white/5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">
                            vs {c.opponent || '—'} <span className="text-slate-400">•</span> {c.result || '—'}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-400">
                            {c.date || '—'} • {c.tournament || '—'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold tabular-nums">{Number.isFinite(c.elo) ? c.elo.toFixed(0) : '—'}</div>
                          <div className="text-xs text-slate-400 tabular-nums">{c.delta || ''}</div>
                        </div>
                      </div>
                      {c.tournamentDetail ? (
                        <a
                          className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-indigo-200 hover:text-indigo-100"
                          href={c.tournamentDetail}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Details <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums">{value}</div>
    </div>
  )
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-sm font-semibold tabular-nums">{value}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-slate-400">{label}</div>
      <div className="font-semibold tabular-nums text-slate-100">{value}</div>
    </div>
  )
}
