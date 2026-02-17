
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, SlidersHorizontal, Trophy, TrendingUp, Users, Sparkles, ArrowRight } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart, CartesianGrid } from 'recharts'
import { useI18n } from '../features/i18n/i18n'
import { useLastTournamentLabel, useStandings, type StandingsRow } from '../features/elo/hooks'
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
  const { seg, slug } = useParams()
  const nav = useNavigate()
  const { t } = useI18n()
  const { openModal } = useModal()

  const [mode, setMode] = useState<'elo' | 'dcpr'>('elo')
  const [query, setQuery] = useState('')

  const standingsElo = useStandings('elo')
  const standingsDcpr = useStandings('dcpr')
  const standings = mode === 'elo' ? standingsElo : standingsDcpr
  const lastTournament = useLastTournamentLabel()

  const rows = standings.data ?? []
  const filtered = useMemo(() => {
    const q = normalizeKey(query)
    if (!q) return rows
    return rows.filter((r) => normalizeKey(r.player).includes(q))
  }, [rows, query])

  const top = useMemo(() => filtered.slice(0, 50), [filtered])

  const stats = useMemo(() => {
    const eloRows = standingsElo.data ?? []
    const dcprRows = standingsDcpr.data ?? []

    const eloRatings = eloRows.map((r) => r.rating).filter((n) => Number.isFinite(n))
    const dcprRatings = dcprRows.map((r) => r.rating).filter((n) => Number.isFinite(n))

    const totalGames = eloRows
      .map((r) => r.games)
      .filter((n) => Number.isFinite(n))
      .reduce((a, b) => a + b, 0)

    return {
      players: eloRows.length || rows.length,
      medianElo: Math.round(median(eloRatings) || 0),
      medianDcpr: Math.round(median(dcprRatings) || 0),
      totalGames,
    }
  }, [rows.length, standingsElo.data, standingsDcpr.data])

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

  const sparkleSeries = useMemo(() => {
    // A small “sparkline” feel: top 12 ratings as a curve
    const s = [...rows].sort((a, b) => a.rank - b.rank).slice(0, 12)
    return s.map((r) => ({ name: r.player.split(' ')[0], rating: r.rating }))
  }, [rows])

  // Deep link: open player modal if route matches /player/:slug
  useEffect(() => {
    if (!slug) return
    const p = rows.find((r) => r.slug === slug) || null
    if (!p) return
    openModal({
      title: p.player,
      content: <PlayerProfileModalContent player={p} mode={mode} onClose={() => nav(`/${seg || 'cz'}`)} />,
      size: 'xl',
      onClose: () => nav(`/${seg || 'cz'}`),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, rows])

  const openPlayer = (p: StandingsRow) => {
    nav(`/${seg || 'cz'}/player/${p.slug}`)
  }

  const loading = standings.isLoading || standingsElo.isLoading || standingsDcpr.isLoading || lastTournament.isLoading

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
              <span>{t('hero_badge') || 'Živý žebříček • rychlé vyhledávání • moderní grafy'}</span>
            </motion.div>

            <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {t('hero_title') || 'DC ELO — přehledně, rychle a krásně'}
            </h1>
            <p className="max-w-2xl text-pretty text-slate-300 leading-relaxed">
              {t('hero_subtitle') ||
                'Sleduj formu hráčů, vývoj ratingu a výsledky turnajů. Přepni ELO/DCPR a otevři profil hráče s interaktivním grafem.'}
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
                  <Users className="h-4 w-4" /> {t('stat_players') || 'Hráčů'}
                </div>
                <div className="mt-1 text-2xl font-semibold text-white">{loading ? '—' : stats.players}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-slate-300 text-xs">
                  <TrendingUp className="h-4 w-4" /> {t('stat_median_elo') || 'Medián ELO'}
                </div>
                <div className="mt-1 text-2xl font-semibold text-white">{loading ? '—' : stats.medianElo}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-slate-300 text-xs">
                  <Trophy className="h-4 w-4" /> {t('stat_median_dcpr') || 'Medián DCPR'}
                </div>
                <div className="mt-1 text-2xl font-semibold text-white">{loading ? '—' : stats.medianDcpr}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-slate-300 text-xs">
                  <SlidersHorizontal className="h-4 w-4" /> {t('stat_total_games') || 'Total games'}
                </div>
                <div className="mt-1 text-2xl font-semibold text-white">{loading ? '—' : stats.totalGames.toLocaleString()}</div>
              </div>
            </div>

            <div className="text-xs text-slate-400">
              {t('latest_data') || 'Latest data:'}{' '}
              <span className="text-slate-200">{lastTournament.data || (loading ? 'načítám…' : '—')}</span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">{t('hero_chart_title') || 'Top hráči — aktuální rating'}</div>
                <div className="text-xs text-slate-400">{mode.toUpperCase()}</div>
              </div>
              <div className="mt-4 h-56">
                {loading ? (
                  <Skeleton className="h-full w-full rounded-2xl" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparkleSeries} margin={{ left: 4, right: 6, top: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgb(99 102 241 / 0.55)" />
                          <stop offset="100%" stopColor="rgb(99 102 241 / 0)" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: 'rgba(226,232,240,0.7)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(226,232,240,0.55)', fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
                      <Tooltip content={<GlassTooltip />} />
                      <Area type="monotone" dataKey="rating" stroke="rgba(129,140,248,0.9)" fill="url(#grad)" isAnimationActive animationDuration={900} />
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
                <div className="text-sm font-semibold text-white">{t('news_title') || 'Novinky & články'}</div>
                <div className="text-xs text-slate-400">{t('news_sub') || 'Rychlé info ze scény'}</div>
              </div>
              <div className="mt-4">
                <NewsCarousel
                  items={[
                    {
                      tag: 'Update',
                      title: 'Vylepšené grafy a rychlejší profil hráče',
                      date: lastTournament.data || '—',
                      excerpt: 'Nový interaktivní graf: zoom, delta sloupce a filtry podle období.',
                    },
                    {
                      tag: 'Turnaje',
                      title: 'Jak číst ELO/DCPR po turnajích',
                      date: 'Tip',
                      excerpt: 'ELO je citlivé na soupeře. DCPR víc vyhlazuje výkyvy. Přepínač nahoře ti ukáže obě perspektivy.',
                    },
                    {
                      tag: 'Insight',
                      title: 'Rozložení ratingu: kde je největší “tlačenice”',
                      date: 'Statistika',
                      excerpt: 'Histogram ukáže, ve kterých pásmech je nejvíc hráčů a kde se rozhoduje o třídách A–D.',
                    },
                  ]}
                />
              </div>
            </div>
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

      {/* Leaderboard */}
      <section id="leaderboard" className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-white">{t('leaderboard_title') || 'Žebříček'}</div>
            <div className="text-xs text-slate-400">{t('leaderboard_sub') || 'Klikni na hráče pro detail.'}</div>
          </div>
          <div className="text-xs text-slate-400">{loading ? 'načítám…' : `${filtered.length} hráčů`}</div>
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
