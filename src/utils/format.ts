export function formatNumber(n: number) {
  return new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 0 }).format(n)
}

export function formatPercent(v01: number) {
  const v = Math.max(0, Math.min(1, v01))
  return new Intl.NumberFormat('cs-CZ', { style: 'percent', maximumFractionDigits: 1 }).format(v)
}
