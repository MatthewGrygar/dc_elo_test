import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { DataSource, ThemeMode } from '../types/app';
import { getPreferredThemeMode } from '../utils/theme';

type AppPreferencesState = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;

  dataSource: DataSource;
  setDataSource: (source: DataSource) => void;
};

const AppPreferencesContext = createContext<AppPreferencesState | null>(null);

const STORAGE_KEYS = {
  theme: 'dc-elo:theme',
  source: 'dc-elo:dataSource'
} as const;

export function AppPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.theme) as ThemeMode | null;
    return stored ?? getPreferredThemeMode();
  });

  const [dataSource, setDataSourceState] = useState<DataSource>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.source) as DataSource | null;
    return stored ?? 'ELO';
  });

  const setThemeMode = (mode: ThemeMode) => setThemeModeState(mode);
  const toggleThemeMode = () => setThemeModeState((m) => (m === 'dark' ? 'light' : 'dark'));
  const setDataSource = (source: DataSource) => setDataSourceState(source);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.theme, themeMode);
    document.documentElement.dataset.theme = themeMode;
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.source, dataSource);
  }, [dataSource]);

  const value = useMemo(
    () => ({ themeMode, setThemeMode, toggleThemeMode, dataSource, setDataSource }),
    [themeMode, dataSource]
  );

  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>;
}

export function useAppPreferences() {
  const ctx = useContext(AppPreferencesContext);
  if (!ctx) throw new Error('useAppPreferences must be used within AppPreferencesProvider');
  return ctx;
}
