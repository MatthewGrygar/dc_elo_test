import React from 'react';
import type { DataSource, Theme } from '@/types/dc';

type AppState = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;

  dataSource: DataSource;
  setDataSource: (s: DataSource) => void;
};

const AppStateContext = React.createContext<AppState | null>(null);

const THEME_KEY = 'dcelo.theme';
const SOURCE_KEY = 'dcelo.source';

function safeGet(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function initialTheme(): Theme {
  const stored = safeGet(THEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

function initialSource(): DataSource {
  const stored = safeGet(SOURCE_KEY);
  if (stored === 'ELO' || stored === 'DCPR') return stored;
  return 'ELO';
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>(initialTheme);
  const [dataSource, setDataSourceState] = React.useState<DataSource>(initialSource);

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
    safeSet(THEME_KEY, theme);
  }, [theme]);

  React.useEffect(() => {
    safeSet(SOURCE_KEY, dataSource);
  }, [dataSource]);

  const value = React.useMemo<AppState>(
    () => ({
      theme,
      setTheme: (t) => setThemeState(t),
      toggleTheme: () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark')),
      dataSource,
      setDataSource: (s) => setDataSourceState(s),
    }),
    [theme, dataSource],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = React.useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
