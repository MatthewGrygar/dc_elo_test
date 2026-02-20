import React from 'react';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'dc-elo.theme';

function getPreferredTheme(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode;
}

type ThemeContextValue = {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = React.useState<ThemeMode>(() => {
    // SSR safe-ish: vite is client-only for GH Pages, but keep it defensive.
    return typeof window === 'undefined' ? 'dark' : getPreferredTheme();
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    applyTheme(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      mode,
      toggle: () => setModeState((m) => (m === 'dark' ? 'light' : 'dark')),
      setMode: (m) => setModeState(m)
    }),
    [mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
