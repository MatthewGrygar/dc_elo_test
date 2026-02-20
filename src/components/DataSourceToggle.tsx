import React from 'react';
import type { DataSource } from '@/types/dc';

export function DataSourceToggle({
  value,
  onChange,
}: {
  value: DataSource;
  onChange: (v: DataSource) => void;
}) {
  return (
    <div className="sourceToggle" role="group" aria-label="Zdroj dat">
      <button
        className={value === 'ELO' ? 'sourceBtn active' : 'sourceBtn'}
        onClick={() => onChange('ELO')}
        type="button"
      >
        ELO
      </button>
      <button
        className={value === 'DCPR' ? 'sourceBtn active' : 'sourceBtn'}
        onClick={() => onChange('DCPR')}
        type="button"
      >
        DCPR
      </button>
    </div>
  );
}
