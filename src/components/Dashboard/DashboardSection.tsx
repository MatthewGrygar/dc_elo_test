import React, { useMemo } from 'react';
import type { KPIStat } from '../../types/app';
import type { Player } from '../../types/player';
import { Panel } from '../common/Panel';
import { InlineStatus } from '../common/InlineStatus';
import { SummaryPanels } from './SummaryPanels';
import { ChartsGrid } from './ChartsGrid';

export function DashboardSection({
  kpis,
  players,
  isLoading,
  error
}: {
  kpis: KPIStat[];
  players: Player[];
  isLoading: boolean;
  error: string | null;
}) {
  const showEmpty = !isLoading && !error && players.length === 0;

  const chartData = useMemo(() => {
    // Placeholder demo datasets derived from current standings.
    const top10 = players.slice(0, 10);

    const eloBars = top10.map((p) => ({ name: p.name, elo: p.elo }));

    const winrateBars = top10.map((p) => ({ name: p.name, winrate: Math.round(p.winrate * 100) }));

    const distribution = (() => {
      const buckets = [
        { label: '<1400', min: -Infinity, max: 1399 },
        { label: '1400–1499', min: 1400, max: 1499 },
        { label: '1500–1599', min: 1500, max: 1599 },
        { label: '1600–1699', min: 1600, max: 1699 },
        { label: '1700+', min: 1700, max: Infinity }
      ];

      return buckets.map((b) => ({
        bucket: b.label,
        players: players.filter((p) => p.elo >= b.min && p.elo <= b.max).length
      }));
    })();

    const gamesBars = top10.map((p) => ({ name: p.name, games: p.games }));

    // "Wide" chart: synthetic trend, just to place a smooth line.
    const syntheticTrend = Array.from({ length: 18 }, (_, i) => {
      const base = players.reduce((acc, p) => acc + p.games, 0);
      const seasonal = Math.sin(i / 3) * (base ? base * 0.04 : 12);
      return {
        week: `W${i + 1}`,
        games: Math.max(0, Math.round((base ? base / 6 : 60) + seasonal))
      };
    });

    return { eloBars, winrateBars, distribution, gamesBars, syntheticTrend };
  }, [players]);

  return (
    <section id="dashboard" className="section">
      <div className="section__head">
        <div>
          <h2 className="section__title">Dashboard</h2>
          <p className="section__subtitle">Souhrnné KPI a grafy (placeholdery připravené k rozšíření).</p>
        </div>
      </div>

      {error ? (
        <InlineStatus
          tone="danger"
          title="Nepodařilo se načíst data"
          message={`${error}. Zkontroluj CSV URL v .env.local a zda je Google Sheet publikovaný jako CSV.`}
        />
      ) : null}

      {showEmpty ? (
        <InlineStatus
          title="Žádná data"
          message="Zatím nemáme co zobrazit. Připoj veřejné CSV z Google Sheets (viz README)."
        />
      ) : null}

      <SummaryPanels kpis={kpis} isLoading={isLoading} />

      <Panel className="section__card" variant="soft">
        <ChartsGrid data={chartData} isLoading={isLoading} />
      </Panel>
    </section>
  );
}
