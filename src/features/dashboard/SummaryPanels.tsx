import React from 'react';
import { Trophy, Users, Gamepad2, Gauge, TrendingUp, Sparkles } from 'lucide-react';
import type { PlayerStanding, SummaryStats } from '@/types/dc';

function SkeletonNumber() {
  return <div className="skeleton" style={{ width: '72px', height: '34px' }} />;
}

function Tile({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: 'primary' | 'positive' | 'negative' | 'highlight' | 'secondary';
}) {
  return (
    <div className={accent ? `panel kpi kpi--${accent}` : 'panel kpi'}>
      <div className="kpiTop">
        <div className="kpiIcon" aria-hidden="true">
          {icon}
        </div>
        <div className="kpiLabel">{label}</div>
      </div>
      <div className="kpiValue">{value}</div>
      {hint ? <div className="kpiHint">{hint}</div> : null}
    </div>
  );
}

export function SummaryPanels({
  summary,
  isLoading,
}: {
  summary: SummaryStats;
  isLoading: boolean;
}) {
  return (
    <div className="kpiGrid" aria-label="Souhrn">
      <Tile
        icon={<Gauge size={18} />}
        label="Median ELO"
        value={isLoading ? <SkeletonNumber /> : summary.medianElo.toLocaleString('cs-CZ')}
        accent="primary"
      />
      <Tile
        icon={<Gamepad2 size={18} />}
        label="Total games"
        value={isLoading ? <SkeletonNumber /> : summary.totalGames.toLocaleString('cs-CZ')}
      />
      <Tile
        icon={<Users size={18} />}
        label="Unique players"
        value={isLoading ? <SkeletonNumber /> : summary.uniquePlayers.toLocaleString('cs-CZ')}
      />
      <Tile
        icon={<Trophy size={18} />}
        label="Top ELO"
        value={isLoading ? <SkeletonNumber /> : '—'}
        hint="(doplníme z historie)"
        accent="highlight"
      />
      <Tile
        icon={<TrendingUp size={18} />}
        label="Matches / month"
        value={isLoading ? <SkeletonNumber /> : summary.matchesMonth.toLocaleString('cs-CZ')}
        hint="placeholder"
      />
      <Tile
        icon={<Sparkles size={18} />}
        label="Upset %"
        value={isLoading ? <SkeletonNumber /> : `${summary.upsetPercent.toFixed(1)}%`}
        hint="placeholder"
      />
    </div>
  );
}
