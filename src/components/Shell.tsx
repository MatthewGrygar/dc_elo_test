import { Outlet } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Menu, MoonStar, Sun, Globe, Sparkles, LayoutGrid, BarChart3 } from 'lucide-react'
import { ModalProvider, useModal } from './Modal'
import { LANGS, type Lang, useI18n } from '../features/i18n/i18n'
import SupportModalContent from './modals/SupportModalContent'
import UpdatesModalContent from './modals/UpdatesModalContent'
import SimpleContentModal from './modals/SimpleContentModal'
import clsx from 'clsx'

function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function HeaderInner() {
  const { lang, t, setLang } = useI18n()
  const { openModal } = useModal()

  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  const theme = (document.documentElement.dataset.theme || 'dark') as 'dark' | 'light'
  const setTheme = (next: 'dark' | 'light') => {
    localStorage.setItem('dc_elo_theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    document.documentElement.dataset.theme = next
  }

  const navItems = useMemo(() => ([
    { id: 'leaderboard', icon: LayoutGrid, label: t('nav_leaderboard') },
    { id: 'stats', icon: BarChart3, label: t('nav_stats') },
  ]), [t])

  const openSupport = () => openModal({ title: t('support_title'), content: <SupportModalContent /> })
  const openUpdates = () => openModal({ title: t('updates_title'), content: <UpdatesModalContent /> })
  const openAbout = () => openModal({ title: t('about_title'), content: <SimpleContentModal kind="about" /> })

  return (
    <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-slate-950/50 bg-slate-950/70 border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center gap-3">
        <button
          className="md:hidden p-2 rounded-xl hover:bg-white/5 border border-white/10"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-white/5 border border-white/10 grid place-items-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold tracking-tight">DC ELO</div>
            <div className="text-xs text-white/60">Grail Series</div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-2 ml-6">
          {navItems.map((it) => (
            <button
              key={it.id}
              onClick={() => scrollToId(it.id)}
              className="px-3 py-2 rounded-xl text-sm text-white/80 hover:text-white hover:bg-white/5 border border-white/10 flex items-center gap-2"
            >
              <it.icon className="h-4 w-4" />
              {it.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            className="px-3 py-2 rounded-xl text-sm text-white/80 hover:text-white hover:bg-white/5 border border-white/10 hidden sm:inline-flex"
            onClick={openUpdates}
          >
            {t('updates_btn')}
          </button>
          <button
            className="px-3 py-2 rounded-xl text-sm text-white/80 hover:text-white hover:bg-white/5 border border-white/10 hidden sm:inline-flex"
            onClick={openSupport}
          >
            {t('support_btn')}
          </button>

          <div className="relative">
            <button
              className="p-2 rounded-xl hover:bg-white/5 border border-white/10"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Theme"
            >
              {theme === 'dark' ? <MoonStar className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
          </div>

          <div className="relative">
            <button
              className={clsx('p-2 rounded-xl hover:bg-white/5 border border-white/10 flex items-center gap-1', langOpen && 'bg-white/5')}
              onClick={() => setLangOpen((v) => !v)}
              aria-label="Language"
            >
              <Globe className="h-5 w-5" />
              <ChevronDown className="h-4 w-4 text-white/60" />
            </button>

            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 mt-2 w-40 rounded-2xl border border-white/10 bg-slate-950/90 backdrop-blur shadow-soft overflow-hidden"
                >
                  {LANGS.map((l) => (
                    <button
                      key={l}
                      className={clsx(
                        'w-full text-left px-3 py-2 text-sm hover:bg-white/5',
                        l === lang && 'text-white',
                        l !== lang && 'text-white/70'
                      )}
                      onClick={() => {
                        setLang(l as Lang)
                        setLangOpen(false)
                      }}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                  <div className="border-t border-white/10" />
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-white/70 hover:bg-white/5"
                    onClick={() => {
                      openAbout()
                      setLangOpen(false)
                    }}
                  >
                    {t('about_btn')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-white/10"
          >
            <div className="px-4 py-3 flex flex-col gap-2">
              {navItems.map((it) => (
                <button
                  key={it.id}
                  className="px-3 py-2 rounded-xl text-sm text-white/80 hover:text-white hover:bg-white/5 border border-white/10 flex items-center gap-2"
                  onClick={() => {
                    scrollToId(it.id)
                    setMenuOpen(false)
                  }}
                >
                  <it.icon className="h-4 w-4" />
                  {it.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default function Shell() {
  return (
    <ModalProvider>
      <div className="min-h-screen bg-slate-950 text-white">
        <HeaderInner />
        <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
          <Outlet />
        </main>
      </div>
    </ModalProvider>
  )
}
