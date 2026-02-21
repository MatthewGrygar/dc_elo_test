import React from 'react';
import { SegmentedToggle } from '../common/SegmentedToggle';
import { useAppPreferences } from '../../context/AppPreferencesContext';
import type { DataSource } from '../../types/app';

const OPTIONS = [
  { value: 'ELO', label: 'ELO' },
  { value: 'DCPR', label: 'DCPR' }
] as const;

export function DataSourceToggle() {
  const { dataSource, setDataSource } = useAppPreferences();

  return (
    <SegmentedToggle<DataSource>
      value={dataSource}
      options={OPTIONS}
      onChange={setDataSource}
      ariaLabel="Zdroj dat"
    />
  );
}
