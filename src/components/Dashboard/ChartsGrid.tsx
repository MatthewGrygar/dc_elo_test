import { useMemo } from 'react';
import { useData } from '../../context/data-context';
import { SimpleAreaChart, SimpleBarChart } from '../common/SimpleCharts';

/**
 * Placeholder charts (dependency-free).
 *
 * Layout and visuals are prepared for future wiring to real datasets.
 */
export function ChartsGrid() {
  const { players } = useData();

  const top10 = useMemo(() => players.slice(0, 10), [players]);

  const buckets = useMemo(() => {
    const ranges = [
      { label: '<1500', min: -Infinity, max: 1499 },
      { label: '1500–1599', min: 1500, max: 1599 },
      { label: '1600–1699', min: 1600, max: 1699 },
      { label: '1700–1799', min: 1700, max: 1799 },
      { label: '1800+', min: 1800, max: Infinity },
    ];
    return ranges.map((r) => ({
      range: r.label,
      players: players.filter((p) => p.elo >= r.min && p.elo <= r.max).length,
    }));
  }, [players]);

  const trend = useMemo(() => {
    const base = 40;
    return Array.from({ length: 16 }).map((_, i) => {
      const wobble = Math.sin(i / 2.4) * 8;
      const growth = i * 2.6;
      return Math.max(0, Math.round(base + growth + wobble));
    });
  }, []);

  return (
    <div className="chartsGrid">
      <div className="panel chart chart--wide">
        <div className="chart__header">
          <div className="chart__title">Vývoj počtu her (placeholder)</div>
          <div className="chart__hint">Později napojíme na historii zápasů</div>
        </div>
        <div className="chart__body">
          <SimpleAreaChart values={trend} height={260} />
        </div>
      </div>

      <div className="panel chart">
        <div className="chart__header">
          <div className="chart__title">Top 10 ELO</div>
          <div className="chart__hint">Aktuální pořadí</div>
        </div>
        <div className="chart__body">
          <SimpleBarChart
            values={top10.map((p) => p.elo)}
            labels={top10.map((p) => p.name.split(' ')[0])}
            colorVar="--accent-5"
          />
        </div>
      </div>

      <div className="panel chart">
        <div className="chart__header">
          <div className="chart__title">Rozdělení ELO</div>
          <div className="chart__hint">Počet hráčů v pásmech</div>
        </div>
        <div className="chart__body">
          <SimpleBarChart
            values={buckets.map((b) => b.players)}
            labels={buckets.map((b) => b.range)}
            colorVar="--accent-2"
          />
        </div>
      </div>

      <div className="panel chart">
        <div className="chart__header">
          <div className="chart__title">Winrate (placeholder)</div>
          <div className="chart__hint">Napojíme na match history</div>
        </div>
        <div className="chart__body">
          <SimpleAreaChart
            values={top10.map((_, i) => Math.max(35, Math.min(80, 42 + i * 2)))}
            labelLeft="80%"
            labelRight="35%"
          />
        </div>
      </div>

      <div className="panel chart">
        <div className="chart__header">
          <div className="chart__title">Games (Top 10)</div>
          <div className="chart__hint">Aktivita hráčů</div>
        </div>
        <div className="chart__body">
          <SimpleBarChart
            values={top10.map((p) => p.games)}
            labels={top10.map((p) => p.name.split(' ')[0])}
            colorVar="--accent-4"
          />
        </div>
      </div>
    </div>
  );
}
