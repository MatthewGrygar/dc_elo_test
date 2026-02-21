import { useAppSettings } from '../../context/AppSettingsContext';
import type { DataSource } from '../../types/app';

function Pill({ active, children }: { active: boolean; children: React.ReactNode }) {
  return <span className={active ? 'pill pill--active' : 'pill'}>{children}</span>;
}

export function DataSourceToggle() {
  const { dataSource, setDataSource } = useAppSettings();
  const set = (s: DataSource) => () => setDataSource(s);

  return (
    <div className="segmented" role="group" aria-label="Data source toggle">
      <button type="button" className="segmented__btn" onClick={set('ELO')}>
        <Pill active={dataSource === 'ELO'}>ELO</Pill>
      </button>
      <button type="button" className="segmented__btn" onClick={set('DCPR')}>
        <Pill active={dataSource === 'DCPR'}>DCPR</Pill>
      </button>
    </div>
  );
}
