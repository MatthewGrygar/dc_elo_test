import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo } from 'react'
import { I18nProvider, detectPreferredLang, langToSegment, segmentToLang } from './features/i18n/i18n'
import Shell from './components/Shell'
import HomePage from './pages/HomePage'

function RedirectRestorer() {
  const nav = useNavigate()
  const loc = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(loc.search)
    const redirect = params.get('redirect')
    if (!redirect) return

    // Remove redirect param first to avoid loops.
    params.delete('redirect')
    nav({ pathname: '/', search: params.toString() ? `?${params.toString()}` : '' }, { replace: true })

    // Then navigate to the original path.
    try {
      const url = new URL(redirect, window.location.origin)
      nav(url.pathname + url.search + url.hash, { replace: true })
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

function AutoLangRedirect() {
  const seg = useMemo(() => langToSegment(detectPreferredLang()), [])
  return <Navigate to={`/${seg}`} replace />
}

export default function App() {
  // Theme boot: keep it super lightweight.
  useEffect(() => {
    const stored = localStorage.getItem('dc_elo_theme')
    const theme = stored === 'light' ? 'light' : 'dark'
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.dataset.theme = theme
  }, [])

  return (
    <I18nProvider>
      <RedirectRestorer />
      <Routes>
        <Route path="/" element={<AutoLangRedirect />} />
        <Route path="/:seg" element={<Shell />}
        >
          <Route index element={<HomePage />} />
          <Route path="player/:slug" element={<HomePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </I18nProvider>
  )
}

// Small safety check for invalid segments is handled inside I18nProvider/Shell.
export function normalizeSeg(seg: string | undefined) {
  const lang = segmentToLang(seg || '')
  return lang ? (seg as 'cz' | 'eng' | 'fr') : null
}
