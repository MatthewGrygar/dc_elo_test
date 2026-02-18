import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './styles.css'

// Theme boot: default dark, allow persisted preference
const savedTheme = (localStorage.getItem('dc_elo_theme') as 'dark' | 'light' | null) ?? 'dark'
document.documentElement.classList.toggle('dark', savedTheme === 'dark')
document.documentElement.dataset.theme = savedTheme
document.documentElement.style.colorScheme = savedTheme

// PWA: keep it silent; auto-update in the background.
registerSW({ immediate: true })

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
})

/**
 * Determine SPA basename at runtime.
 *
 * Goals:
 * - Works on GitHub Pages project sites: https://user.github.io/<repo>/
 * - Works on GitHub Pages user sites / custom domains: https://example.com/
 * - Keeps the repo portable (no hardcoded repo name).
 */
function getBasename() {
  const { hostname, pathname } = window.location

  // Local dev / previews typically run at root.
  if (hostname === 'localhost' || hostname === '127.0.0.1') return ''

  // GitHub Pages project site: /<repo>/...
  if (hostname.endsWith('github.io')) {
    const parts = pathname.split('/').filter(Boolean)
    // If there is at least one segment, treat the first one as the repo.
    // For user pages, parts might be empty -> root.
    return parts.length > 0 ? `/${parts[0]}` : ''
  }

  // Custom domains are generally served from root.
  return ''
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={getBasename()}>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
