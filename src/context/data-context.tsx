import React, { createContext, useContext } from 'react';
import type { DataSource, Player } from '../types/player';
import { useStandings } from '../hooks/useStandings';
import { DataSourceContext } from './data-source-context';

type DataContextValue = {
  dataSource: DataSource;
  players: Player[];
  stats: {
    playersCount: number;
    gamesTotal: number;
    avgElo: number;
    topElo: number;
  };
  isLoading: boolean;
  error: string | null;
};

export const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const dsCtx = useContext(DataSourceContext);
  if (!dsCtx) throw new Error('DataProvider must be used within <DataSourceProvider>.');

  const { dataSource } = dsCtx;
  const { players, stats, isLoading, error } = useStandings(dataSource);

  return (
    <DataContext.Provider value={{ dataSource, players, stats, isLoading, error }}>{children}</DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within <DataProvider>.');
  return ctx;
}
