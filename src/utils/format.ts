export function formatCompactNumber(n: number) {
  return new Intl.NumberFormat('cs-CZ', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

export function formatElo(n: number) {
  return new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 0 }).format(Math.round(n));
}

export function formatPercent01(v: number) {
  return `${Math.round(v * 100)}%`;
}
