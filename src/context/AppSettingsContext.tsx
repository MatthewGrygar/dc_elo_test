import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { DataSource, ThemeMode } from '../types/app';
import { readLocalStorage, writeLocalStorage } from '../utils/storage';

type AppSettingsState = {
  theme: ThemeMode;
  dataSource: DataSource;

  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;

  setDataSource: (s: DataSource) => void;
  toggleDataSource: () => void;
};

const AppSettingsContext = createContext<AppSettingsState | null>(null);

const LS_THEME_KEY = 'dc-elo.theme';
const LS_SOURCE_KEY = 'dc-elo.source';

function applyThemeToDom(theme: ThemeMode) {
  document.documentElement.setAttribute('data-theme', theme);
}

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(() => readLocalStorage(LS_THEME_KEY, 'dark'));
  const [dataSource, setDataSource] = useState<DataSource>(() => readLocalStorage(LS_SOURCE_KEY, 'ELO'));

  useEffect(() => {
    applyThemeToDom(theme);
    writeLocalStorage(LS_THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    writeLocalStorage(LS_SOURCE_KEY, dataSource);
  }, [dataSource]);

  const value = useMemo<AppSettingsState>(
    () => ({
      theme,
      dataSource,
      setTheme,
      toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
      setDataSource,
      toggleDataSource: () => setDataSource((s) => (s === 'ELO' ? 'DCPR' : 'ELO')),
    }),
    [theme, dataSource]
  );

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error('useAppSettings must be used inside AppSettingsProvider');
  return ctx;
}
