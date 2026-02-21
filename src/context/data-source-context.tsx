import React, { createContext, useCallback, useMemo, useState } from 'react';
import type { DataSource } from '../types/player';

type DataSourceContextValue = {
  dataSource: DataSource;
  setDataSource: (v: DataSource) => void;
};

export const DataSourceContext = createContext<DataSourceContextValue | null>(null);

export function DataSourceProvider({ children }: { children: React.ReactNode }) {
  const [dataSource, setDataSourceState] = useState<DataSource>('ELO');

  const setDataSource = useCallback((v: DataSource) => setDataSourceState(v), []);
  const value = useMemo(() => ({ dataSource, setDataSource }), [dataSource, setDataSource]);

  return <DataSourceContext.Provider value={value}>{children}</DataSourceContext.Provider>;
}
