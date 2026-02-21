import { useContext } from 'react'
import { DataSourceContext } from '../context/DataSourceContext'

export function useDataSource() {
  const ctx = useContext(DataSourceContext)
  if (!ctx) throw new Error('useDataSource must be used within DataSourceProvider')
  return ctx
}
