import { useMemo } from 'react';

type Point = { x: number; y: number };

function buildPath(points: Point[]): string {
  if (points.length === 0) return '';
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ');
}

function normalize(values: number[], w: number, h: number, pad = 10): Point[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  return values.map((v, i) => {
    const t = values.length === 1 ? 0 : i / (values.length - 1);
    const x = pad + t * (w - pad * 2);
    const y = pad + (1 - (v - min) / span) * (h - pad * 2);
    return { x, y };
  });
}

export function SimpleAreaChart({
  values,
  height = 220,
  labelLeft,
  labelRight,
}: {
  values: number[];
  height?: number;
  labelLeft?: string;
  labelRight?: string;
}) {
  const w = 640;
  const h = height;

  const { linePath, areaPath, min, max } = useMemo(() => {
    const pts = normalize(values, w, h);
    const line = buildPath(pts);
    const area =
      pts.length > 0
        ? `${line} L ${pts[pts.length - 1]!.x.toFixed(2)} ${(h - 10).toFixed(2)} L ${pts[0]!.x.toFixed(2)} ${(h - 10).toFixed(2)} Z`
        : '';
    return {
      linePath: line,
      areaPath: area,
      min: values.length ? Math.min(...values) : 0,
      max: values.length ? Math.max(...values) : 0,
    };
  }, [values, h]);

  return (
    <div style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img" aria-label="Graf">
        <defs>
          <linearGradient id="simpleFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-1)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--accent-1)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* subtle grid */}
        {Array.from({ length: 4 }).map((_, i) => {
          const y = 10 + (i * (h - 20)) / 3;
          return <line key={i} x1="10" y1={y} x2={w - 10} y2={y} stroke="var(--chart-grid)" strokeDasharray="6 8" />;
        })}

        <path d={areaPath} fill="url(#simpleFill)" />
        <path d={linePath} fill="none" stroke="var(--accent-1)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />

        <text x="10" y="16" fill="var(--text-muted)" fontSize="12">{labelLeft ?? `${Math.round(max)}`}</text>
        <text x={w - 10} y={h - 6} fill="var(--text-muted)" fontSize="12" textAnchor="end">
          {labelRight ?? `${Math.round(min)}`}
        </text>
      </svg>
    </div>
  );
}

export function SimpleBarChart({
  values,
  labels,
  height = 220,
  colorVar = '--accent-5',
}: {
  values: number[];
  labels: string[];
  height?: number;
  colorVar?: string;
}) {
  const w = 640;
  const h = height;
  const pad = 14;
  const max = Math.max(1, ...values);

  const bars = values.map((v, i) => {
    const bw = (w - pad * 2) / values.length;
    const x = pad + i * bw + 6;
    const barW = Math.max(8, bw - 12);
    const barH = (v / max) * (h - 40);
    const y = h - 22 - barH;
    return { x, y, barW, barH, v, label: labels[i] ?? '' };
  });

  return (
    <div style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img" aria-label="Sloupcový graf">
        {bars.map((b, i) => (
          <g key={i}>
            <rect
              x={b.x}
              y={b.y}
              width={b.barW}
              height={b.barH}
              rx={10}
              fill={`var(${colorVar})`}
              opacity={0.9}
            />
            <text x={b.x + b.barW / 2} y={h - 8} fill="var(--text-muted)" fontSize="12" textAnchor="middle">
              {b.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
