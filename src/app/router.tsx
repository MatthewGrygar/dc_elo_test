import React, { useEffect } from 'react'
import { createBrowserRouter, Navigate, RouterProvider, useLocation, useNavigate } from 'react-router-dom'
import { computeBasename } from './basename'
import Shell from '../widgets/shell/Shell'
import HomePage from '../pages/home/HomePage'

function RedirectRestorer() {
  const nav = useNavigate()
  const loc = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(loc.search)
    const redirect = params.get('redirect')
    if (!redirect) return

    params.delete('redirect')
    nav({ pathname: '/', search: params.toString() ? `?${params.toString()}` : '' }, { replace: true })

    try {
      const url = new URL(redirect, window.location.origin)
      const base = computeBasename()
      const restoredPath = url.pathname.startsWith(base) ? url.pathname.slice(base.length) || '/' : url.pathname
      nav(restoredPath + url.search + url.hash, { replace: true })
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

function Root() {
  return (
    <>
      <RedirectRestorer />
      <Shell />
    </>
  )
}

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Root />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'player/:slug', element: <HomePage /> },
      ],
    },
    // Back-compat: old language-segment URLs (/#/cz, /cz/player/...) → just land on '/'
    { path: '/:seg/*', element: <Navigate to='/' replace /> },
    { path: '*', element: <Navigate to='/' replace /> },
  ],
  {
    basename: computeBasename(),
  },
)

export default function AppRouter() {
  return <RouterProvider router={router} />
}
