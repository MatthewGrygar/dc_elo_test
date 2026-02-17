
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Menu, MoonStar, Sun, Globe, Sparkles, LayoutGrid, BarChart3 } from 'lucide-react'
import { ModalProvider, useModal } from './Modal'
import { useI18n, langToSegment, segmentToLang } from '../features/i18n/i18n'
import SupportModalContent from './modals/SupportModalContent'
import UpdatesModalContent from './modals/UpdatesModalContent'
import SimpleContentModal from './modals/SimpleContentModal'
import clsx from 'clsx'

function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function Header() {
  const { seg } = useParams()
  const loc = useLocation()
  const nav = useNavigate()
  const { lang, t, setLang } = useI18n()
  const { openModal } = useModal()

  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  const theme = (document.documentElement.dataset.theme || 'dark') as 'dark' | 'light'

  const setTheme = (next: 'dark' | 'light') => {
    localStorage.setItem('dc_elo_theme', next)
    document.documentElement.dataset.theme = next
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  const safeSeg = useMemo(() => (segmentToLang(seg || '') ? (seg as 'cz' | 'eng' | 'fr') : null), [seg])

  useEffect(() => {
    if (!safeSeg) return
    const l = segmentToLang(safeSeg)
    if (l && l !== lang) setLang(l)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeSeg])

  const changeLang = (l: 'cs' | 'en' | 'fr') => {
    setLang(l)
    nav(`/${langToSegment(l)}`, { replace: true })
    setLangOpen(false)
  }

  const openAnon = () => {
    openModal({
      title: t('anon_modal_title'),
      content: (
        <div className="space-y-4">
          <div className="text-xl font-semibold tracking-tight">{t('anon_modal_h1')}</div>
          <p className="text-slate-200">{t('anon_modal_p1')}</p>
          <p className="text-slate-300 leading-relaxed">{t('anon_modal_p2')}</p>
          <p className="text-slate-300 leading-relaxed">{t('anon_modal_p3')}</p>
          <div>
            <a
              className="inline-flex items-center justify-center rounded-2xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-indigo-400"
              href="https://docs.google.com/forms/d/e/1FAIpQLSfwFbnvW9SnOvGZ3KGhk4mHx61GIrWdQBSIp8vGovC1xr9wDg/viewform?usp=dialog"
              target="_blank"
              rel="noreferrer"
            >
              {t('anon_modal_cta')}
            </a>
          </div>
        </div>
      ),
      size: 'md',
    })
  }

  const openUpdates = () => {
    openModal({ title: t('updates_title'), content: <UpdatesModalContent />, size: 'md' })
  }

  const openSupport = () => {
    openModal({ title: t('support_title'), content: <SupportModalContent />, size: 'md' })
  }

  const navItems = [
    { id: 'leaderboard', label: t('nav_leaderboard') || 'Žebříček', icon: LayoutGrid },
    { id: 'distribution', label: t('nav_stats') || 'Statistiky', icon: BarChart3 },
  ]

  const isHome = useMemo(() => !loc.pathname.includes('/player/'), [loc.pathname])

  const goSection = (id: string) => {
    setMenuOpen(false)
    if (!isHome) nav(`/${safeSeg || 'cz'}`)
    setTimeout(() => scrollToId(id), 0)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <button
          onClick={() => nav(`/${safeSeg || 'cz'}`)}
          className="group inline-flex items-center gap-2 text-left"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-200 ring-1 ring-white/10">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <div className="text-sm font-semibold text-white leading-tight">DC ELO</div>
            <div className="text-[11px] text-slate-400 leading-tight">{t('header_sub') || 'moderní žebříček'}</div>
          </div>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((it) => (
            <button
              key={it.id}
              onClick={() => goSection(it.id)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/0 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/5"
            >
              <it.icon className="h-4 w-4 text-slate-300" />
              {it.label}
            </button>
          ))}
          <button
            onClick={openUpdates}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/0 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/5"
          >
            {t('updates_button')}
          </button>
          <button
            onClick={openSupport}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/0 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/5"
          >
            {t('support_button')}
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
            aria-label="theme"
          >
            {theme === 'dark' ? <MoonStar className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          <div className="relative">
            <button
              onClick={() => setLangOpen((s) => !s)}
              className="inline-flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 text-sm font-semibold text-slate-200 hover:bg-white/10"
              aria-label="language"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">{lang.toUpperCase()}</span>
              <ChevronDown className="h-4 w-4 opacity-70" />
            </button>

            <AnimatePresence>
              {langOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  className="absolute right-0 mt-2 w-40 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/90 shadow-soft backdrop-blur"
                >
                  {(['cs', 'en', 'fr'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => changeLang(l)}
                      className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-white/5"
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setMenuOpen((s) => !s)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 md:hidden"
            aria-label="menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden"
          >
            <div className="mx-auto max-w-6xl px-4 pb-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-3">
                <div className="grid gap-2">
                  {navItems.map((it) => (
                    <button
                      key={it.id}
                      onClick={() => goSection(it.id)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/30 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/5"
                    >
                      <it.icon className="h-4 w-4 text-slate-300" />
                      {it.label}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      openUpdates()
                    }}
                    className="rounded-2xl border border-white/10 bg-slate-950/30 px-3 py-2 text-left text-sm font-semibold text-slate-200 hover:bg-white/5"
                  >
                    {t('updates_button')}
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      openSupport()
                    }}
                    className="rounded-2xl border border-white/10 bg-slate-950/30 px-3 py-2 text-left text-sm font-semibold text-slate-200 hover:bg-white/5"
                  >
                    {t('support_button')}
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      openAnon()
                    }}
                    className="rounded-2xl border border-white/10 bg-slate-950/30 px-3 py-2 text-left text-sm font-semibold text-slate-200 hover:bg-white/5"
                  >
                    {t('anon_button')}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

function Footer() {
  const { t } = useI18n()
  return (
    <footer className="mt-10 border-t border-white/5 py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="text-sm text-slate-300 leading-relaxed">
            <div className="font-semibold text-slate-100">DC ELO</div>
            <div className="text-slate-400">{t('footer_tag') || 'Moderní přehled ratingu a výsledků.'}</div>
          </div>
          <div className="text-sm text-slate-400 sm:text-right">
            <div>{t('footer_note') || 'Data jsou načítána z Google Sheets (CSV).'}</div>
            <div className="mt-1 text-xs">v2 • PWA • React + TS</div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function Shell() {
  return (
    <ModalProvider>
      <div className={clsx('min-h-dvh bg-slate-950 text-slate-100')}>
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-8">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ModalProvider>
  )
}
