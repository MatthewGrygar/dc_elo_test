import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { I18nProvider } from './features/i18n/i18n'
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

      // If we're hosted under a subpath (e.g. GitHub Pages /<repo>/),
      // strip it so React Router's basename can handle it.
      const base = (() => {
        const { hostname, pathname } = window.location
        if (hostname.endsWith('github.io')) {
          const parts = pathname.split('/').filter(Boolean)
          return parts.length > 0 ? `/${parts[0]}` : ''
        }
        return ''
      })()

      const restoredPath = url.pathname.startsWith(base) ? url.pathname.slice(base.length) || '/' : url.pathname

      nav(restoredPath + url.search + url.hash, { replace: true })
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

export default function App() {
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
        <Route path="/" element={<Shell />}>
          <Route index element={<HomePage />} />
          <Route path="player/:slug" element={<HomePage />} />
        </Route>

        {/* Back-compat: old language-segment URLs (/#/cz, /cz/player/...) */}
        <Route path="/:seg/*" element={<Navigate to="/" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </I18nProvider>
  )
}
