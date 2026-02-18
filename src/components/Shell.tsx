import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, MoonStar, Sun } from 'lucide-react'
import { ModalProvider } from './Modal'
import Segmented from './ui/Segmented'
import { EloModeProvider, useEloMode } from '../features/elo/mode'

function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function HeaderInner() {
  const { mode, setMode } = useEloMode()
  const [menuOpen, setMenuOpen] = useState(false)

  const theme = (document.documentElement.dataset.theme || 'dark') as 'dark' | 'light'
  const setTheme = (next: 'dark' | 'light') => {
    localStorage.setItem('dc_elo_theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    document.documentElement.dataset.theme = next
    document.documentElement.style.colorScheme = next
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center gap-3">
        <button
          className="md:hidden p-2 rounded-xl border border-slate-200/70 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/5"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav className="flex items-center gap-2">
          <button
            onClick={scrollToTop}
            className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200/70 bg-white hover:bg-slate-50 text-slate-800 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white/85"
          >
            Domů
          </button>
          <button
            onClick={() => scrollToId('charts')}
            className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200/70 bg-white hover:bg-slate-50 text-slate-800 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white/85"
          >
            Grafy
          </button>
          <button
            onClick={() => scrollToId('leaderboard')}
            className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200/70 bg-white hover:bg-slate-50 text-slate-800 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white/85"
          >
            Hráči
          </button>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Segmented
            value={mode}
            onChange={(v) => setMode(v === 'elo' || v === 'dcpr' ? v : 'elo')}
            options={[
              { value: 'elo', label: 'ELO' },
              { value: 'dcpr', label: 'DCPR' },
            ]}
          />

          <button
            className="p-2 rounded-xl border border-slate-200/70 bg-white hover:bg-slate-50 text-slate-800 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Theme"
          >
            {theme === 'dark' ? <MoonStar className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          <button
            className="p-2 rounded-xl border border-slate-200/70 bg-white hover:bg-slate-50 text-slate-800 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="More"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-slate-200/70 dark:border-white/10"
          >
            <div className="px-4 py-3 text-sm text-slate-600 dark:text-white/70">
              {/* Placeholder: menu content will be added later */}
              Menu
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
      <EloModeProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white bg-grid">
          <HeaderInner />
          <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
            <Outlet />
          </main>
        </div>
      </EloModeProvider>
    </ModalProvider>
  )
}
