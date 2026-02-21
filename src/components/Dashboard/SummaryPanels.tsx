import React from 'react';
import type { KPIStat } from '../../types/app';
import { Panel } from '../common/Panel';
import { formatNumber } from '../../utils/format';

function formatKpi(kpi: KPIStat): string {
  const { value, format } = kpi;
  if (format === 'percent') return `${formatNumber(value, { maximumFractionDigits: 1 })}%`;
  if (format === 'float') return formatNumber(value, { maximumFractionDigits: 1 });
  return formatNumber(Math.round(value));
}

export function SummaryPanels({ kpis, isLoading }: { kpis: KPIStat[]; isLoading: boolean }) {
  return (
    <div className="kpiGrid" aria-label="Souhrnné statistiky">
      {kpis.map((kpi) => (
        <Panel key={kpi.label} className="kpi" variant="soft">
          <div className="kpi__label">{kpi.label}</div>
          <div className="kpi__value">{isLoading ? '—' : formatKpi(kpi)}</div>
          {kpi.hint ? <div className="kpi__hint">{kpi.hint}</div> : null}
        </Panel>
      ))}
    </div>
  );
}
