import { useDataSource } from '../../hooks/useDataSource';
import type { DataSource } from '../../types/player';

function Button({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      className={"segmented__btn " + (active ? 'isActive' : '')}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function DataSourceToggle() {
  const { dataSource, setDataSource } = useDataSource();

  const set = (v: DataSource) => () => setDataSource(v);

  return (
    <div className="segmented" role="group" aria-label="Zdroj dat">
      <Button active={dataSource === 'ELO'} onClick={set('ELO')}>
        ELO
      </Button>
      <Button active={dataSource === 'DCPR'} onClick={set('DCPR')}>
        DCPR
      </Button>
    </div>
  );
}
