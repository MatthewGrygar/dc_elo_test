import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, Trophy } from 'lucide-react'
import { useI18n } from '../features/i18n/i18n'
import { useLastTournamentLabel, useStandings, type StandingsRow } from '../features/elo/hooks'
import { normalizeKey } from '../lib/csv'
import { useModal } from '../components/Modal'
import PlayerProfileModalContent from '../components/modals/PlayerProfileModalContent'

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
  if (!Number.isFinite(n)) return Number.NaN
  return n > 0 && n <= 1 ? n * 100 : n
}

function vtBadge(vt?: string | null) {
  if (!vt) return null
  return (
    <span className="ml-2 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-slate-200">
      {vt}
    </span>
  )
}

export default function HomePage() {
  const { seg, slug } = useParams()
  const { t } = useI18n()
  const nav = useNavigate()
  const { openModal, closeModal } = useModal()

  const [mode, setMode] = useState<'elo' | 'dcpr'>('elo')
  const [query, setQuery] = useState('')

  const standings = useStandings(mode)
  const last = useLastTournamentLabel()

  const rows = standings.data ?? []

  const filtered = useMemo(() => {
    const q = normalizeKey(query)
    return rows.filter((r) => (!q ? true : normalizeKey(r.player).includes(q)))
  }, [rows, query])

  const info = useMemo(() => {
    const ratings = rows.map((r) => r.rating).filter(Number.isFinite)
    const gamesArr = rows.map((r) => r.games).filter(Number.isFinite)
    const winrates = rows.map((r) => parseWinrate(r.winrate)).filter(Number.isFinite)

    const med = median(ratings)
    const totalGamesRaw = gamesArr.reduce((a, b) => a + b, 0)
    const totalGames = Number.isFinite(totalGamesRaw) ? totalGamesRaw / 2 : Number.NaN
    const avgWinrate = winrates.length ? winrates.reduce((a, b) => a + b, 0) / winrates.length : Number.NaN

    return {
      medianElo: med,
      totalGames,
      avgWinrate,
    }
  }, [rows])

  // Open player modal when route contains /player/:slug
  useEffect(() => {
    if (!slug) return
    const player = rows.find((r) => r.slug === slug)
    if (!player) return

    openModal({
      title: player.player,
      subtitle: t('player_modal_title'),
      fullscreen: true,
      content: (
        <PlayerProfileModalContent
          player={player}
          mode={mode}
          onClose={() => {
            closeModal()
            nav(`/${seg}`, { replace: true })
          }}
        />
      ),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, rows, mode])

  const openPlayer = (p: StandingsRow) => {
    nav(`/${seg}/player/${p.slug}`)
  }

  return (
    <div className="space-y-5">
      <HeroCarousel />

      <div className="grid gap-3 md:grid-cols-4">
        <InfoCard label={t('info_median_elo')} value={Number.isFinite(info.medianElo) ? info.medianElo.toFixed(0) : '—'} />
        <InfoCard
          label={t('info_total_games')}
          value={Number.isFinite(info.totalGames) ? info.totalGames.toFixed(0) : '—'}
        />
        <InfoCard label={t('info_unique_players')} value={filtered.length.toString()} />
        <InfoCard label={t('info_last_data')} value={last.data || '—'} />
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                placeholder={t('search_placeholder')}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 py-2.5 pl-10 pr-3 text-sm outline-none ring-indigo-500/30 placeholder:text-slate-500 focus:ring-2"
              />
            </div>

            <button
              className={
                mode === 'dcpr'
                  ? 'inline-flex items-center gap-2 rounded-2xl bg-indigo-500 px-3 py-2.5 text-sm font-semibold text-white'
                  : 'inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10'
              }
              onClick={() => setMode((m) => (m === 'elo' ? 'dcpr' : 'elo'))}
              type="button"
              title={t('rated_only')}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">{t('rated_only')}</span>
              <span className="sm:hidden">DCPR</span>
            </button>
          </div>

          <div className="text-xs text-slate-300">{t('tip_click_player')}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead className="sticky top-[64px] z-10 bg-slate-950/80 backdrop-blur">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <Th className="w-20">{t('th_rank')}</Th>
                <Th>{t('th_player')}</Th>
                <Th className="w-28 text-right">{t('th_rating')}</Th>
                <Th className="w-24 text-right">{t('th_games')}</Th>
                <Th className="w-24 text-right">{t('th_win')}</Th>
                <Th className="w-24 text-right">{t('th_loss')}</Th>
                <Th className="w-24 text-right">{t('th_draw')}</Th>
                <Th className="w-28 text-right">{t('th_peak')}</Th>
                <Th className="w-28 text-right">{t('th_winrate')}</Th>
              </tr>
            </thead>
            <tbody>
              {standings.isLoading && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-sm text-slate-300">
                    Loading…
                  </td>
                </tr>
              )}
              {standings.isError && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-sm text-slate-300">
                    {t('data_load_failed')}
                  </td>
                </tr>
              )}

              {!standings.isLoading && !filtered.length && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-sm text-slate-300">
                    —
                  </td>
                </tr>
              )}

              {filtered.map((r) => (
                <tr
                  key={r.slug}
                  className="border-t border-white/10 text-sm hover:bg-white/5"
                >
                  <td className="px-4 py-3 font-semibold">
                    <span className="inline-flex items-center gap-2">
                      {r.rank <= 3 ? <Trophy className="h-4 w-4 text-yellow-300" /> : null}
                      <span>#{r.rank}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="inline-flex items-center font-semibold text-slate-100 hover:text-indigo-200"
                      onClick={() => openPlayer(r)}
                      type="button"
                    >
                      {r.player}
                    </button>
                    {vtBadge(r.vt)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{Number.isFinite(r.rating) ? r.rating.toFixed(0) : ''}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-200">{Number.isFinite(r.games) ? r.games.toFixed(0) : ''}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-200">{Number.isFinite(r.win) ? r.win.toFixed(0) : ''}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-200">{Number.isFinite(r.loss) ? r.loss.toFixed(0) : ''}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-200">{Number.isFinite(r.draw) ? r.draw.toFixed(0) : ''}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-200">{Number.isFinite(r.peak) ? r.peak.toFixed(0) : ''}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-200">{r.winrate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Th({ children, className }: { children: any; className?: string }) {
  return <th className={['px-4 py-3 font-semibold', className || ''].join(' ')}>{children}</th>
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
    </div>
  )
}

function HeroCarousel() {
  // Keep the same images as the legacy site; per-language images exist.
  const { seg } = useParams()

  const imgs = useMemo(() => {
    const s = seg === 'cz' || seg === 'fr' || seg === 'eng' ? seg : 'eng'
    if (s === 'cz') return ['./assets/images/slider/carousel_cz_1.png', './assets/images/slider/carousel_cz_2.png', './assets/images/slider/carousel_cz_3.png']
    if (s === 'fr') return ['./assets/images/slider/carousel_fr_1.png', './assets/images/slider/carousel_fr_2.png', './assets/images/slider/carousel_fr_3.png']
    return ['./assets/images/slider/carousel_en_1.png', './assets/images/slider/carousel_en_2.png', './assets/images/slider/carousel_en_3.png']
  }, [seg])

  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % imgs.length), 5500)
    return () => clearInterval(t)
  }, [imgs.length])

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-soft">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/15 via-transparent to-fuchsia-500/10" />

      <div className="relative aspect-[16/5] w-full">
        <motion.img
          key={imgs[idx]}
          src={imgs[idx]}
          alt="carousel"
          className="h-full w-full object-cover"
          initial={{ opacity: 0.2, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55 }}
          loading="lazy"
        />
      </div>

      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
        {imgs.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={
              i === idx
                ? 'h-2.5 w-8 rounded-full bg-white/70'
                : 'h-2.5 w-2.5 rounded-full bg-white/30 hover:bg-white/50'
            }
            aria-label={`Slide ${i + 1}`}
            type="button"
          />
        ))}
      </div>
    </div>
  )
}
