import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Menu, MoonStar, Sun, Globe, Sparkles } from 'lucide-react'
import { ModalProvider, useModal } from './Modal'
import { useI18n, langToSegment, segmentToLang } from '../features/i18n/i18n'
import SupportModalContent from './modals/SupportModalContent'
import UpdatesModalContent from './modals/UpdatesModalContent'
import SimpleContentModal from './modals/SimpleContentModal'

function Header() {
  const { seg } = useParams()
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
              rel="noopener noreferrer"
            >
              {t('anon_modal_btn')}
            </a>
          </div>
        </div>
      ),
    })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src="./assets/images/logos/logo.png"
            alt="DC ELO"
            className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 p-1"
          />
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <div className="text-base font-semibold tracking-tight">{t('site_title')}</div>
              <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-xs font-semibold text-indigo-200">
                v2
              </span>
            </div>
            <div className="text-xs text-slate-300">{t('project_desc')}</div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            className="hidden sm:inline-flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10"
            onClick={() => openModal({ title: t('support_modal_title'), content: <SupportModalContent /> })}
          >
            <Sparkles className="h-4 w-4" />
            {t('support')}
          </button>

          <div className="relative">
            <button
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10"
              onClick={() => setLangOpen((v) => !v)}
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">{safeSeg?.toUpperCase() ?? '—'}</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            <AnimatePresence>
              {langOpen && (
                <motion.div
                  className="absolute right-0 mt-2 w-40 overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-soft"
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                >
                  <button className="w-full px-3 py-2 text-left text-sm hover:bg-white/5" onClick={() => changeLang('cs')}>
                    🇨🇿 Čeština
                  </button>
                  <button className="w-full px-3 py-2 text-left text-sm hover:bg-white/5" onClick={() => changeLang('en')}>
                    🇬🇧 English
                  </button>
                  <button className="w-full px-3 py-2 text-left text-sm hover:bg-white/5" onClick={() => changeLang('fr')}>
                    🇫🇷 Français
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? t('theme_light') : t('theme_dark')}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
            <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          <div className="relative">
            <button
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-100 hover:bg-white/10"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={t('menu')}
            >
              <Menu className="h-5 w-5" />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-soft"
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                >
                  <button
                    className="w-full px-4 py-3 text-left text-sm font-semibold hover:bg-white/5"
                    onClick={() => {
                      setMenuOpen(false)
                      openModal({ title: t('updates_title'), content: <UpdatesModalContent /> })
                    }}
                  >
                    {t('menu_news')}
                  </button>
                  <button
                    className="w-full px-4 py-3 text-left text-sm font-semibold hover:bg-white/5"
                    onClick={() => {
                      setMenuOpen(false)
                      openModal({
                        title: t('menu_management'),
                        content: <SimpleContentModal title={t('menu_management')} />, // placeholder
                      })
                    }}
                  >
                    {t('menu_management')}
                  </button>
                  <button
                    className="w-full px-4 py-3 text-left text-sm font-semibold hover:bg-white/5"
                    onClick={() => {
                      setMenuOpen(false)
                      openModal({
                        title: t('menu_articles'),
                        content: <SimpleContentModal title={t('menu_articles')} />, // placeholder
                      })
                    }}
                  >
                    {t('menu_articles')}
                  </button>
                  <div className="border-t border-white/10" />
                  <button
                    className="w-full px-4 py-3 text-left text-sm hover:bg-white/5"
                    onClick={() => {
                      setMenuOpen(false)
                      openAnon()
                    }}
                  >
                    {t('anon_modal_title')}
                  </button>
                  <button
                    className="w-full px-4 py-3 text-left text-sm hover:bg-white/5"
                    onClick={() => {
                      setMenuOpen(false)
                      openModal({ title: t('support_modal_title'), content: <SupportModalContent /> })
                    }}
                  >
                    {t('support')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}

export default function Shell() {
  return (
    <ModalProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-40" />
          <div className="absolute -top-24 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-24 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-3xl" />
        </div>
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-6">
          <Outlet />
        </main>
        <footer className="mx-auto max-w-6xl px-4 pb-10 pt-4 text-xs text-slate-400">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>DC ELO • modern UI build</span>
            <span className="text-slate-500">Data source: Google Sheets</span>
          </div>
        </footer>
      </div>
    </ModalProvider>
  )
}
