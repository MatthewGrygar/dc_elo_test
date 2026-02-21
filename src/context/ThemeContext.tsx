import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import type { ThemeMode } from '../types/core'

const STORAGE_KEY = 'dc-elo.theme'

export type ThemeContextValue = {
  theme: ThemeMode
  setTheme: (t: ThemeMode) => void
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

function getInitialTheme(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored

  // Match OS preference on first visit
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => getInitialTheme())

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [setTheme, theme])

  useEffect(() => {
    // Drive design tokens via data attribute on <html>
    document.documentElement.dataset.theme = theme
  }, [theme])

  const value = useMemo<ThemeContextValue>(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
