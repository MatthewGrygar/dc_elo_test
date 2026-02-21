import React, { createContext, useCallback, useMemo, useState } from 'react'
import type { DataSource } from '../types/core'

const STORAGE_KEY = 'dc-elo.dataSource'

export type DataSourceContextValue = {
  dataSource: DataSource
  setDataSource: (s: DataSource) => void
}

export const DataSourceContext = createContext<DataSourceContextValue | null>(null)

function getInitialSource(): DataSource {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'ELO' || stored === 'DCPR') return stored
  return 'ELO'
}

export function DataSourceProvider({ children }: { children: React.ReactNode }) {
  const [dataSource, setDataSourceState] = useState<DataSource>(() => getInitialSource())

  const setDataSource = useCallback((next: DataSource) => {
    setDataSourceState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const value = useMemo<DataSourceContextValue>(() => ({ dataSource, setDataSource }), [dataSource, setDataSource])

  return <DataSourceContext.Provider value={value}>{children}</DataSourceContext.Provider>
}
