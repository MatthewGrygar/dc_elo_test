import { useDataSource } from '../../hooks/useDataSource'

export function DataSourceToggle() {
  const { dataSource, setDataSource } = useDataSource()

  return (
    <div className="segmented panel panel--soft" role="group" aria-label="Zdroj dat">
      <button
        type="button"
        className={dataSource === 'ELO' ? 'segmentedBtn isActive' : 'segmentedBtn'}
        onClick={() => setDataSource('ELO')}
      >
        ELO
      </button>
      <button
        type="button"
        className={dataSource === 'DCPR' ? 'segmentedBtn isActive' : 'segmentedBtn'}
        onClick={() => setDataSource('DCPR')}
      >
        DCPR
      </button>
    </div>
  )
}
