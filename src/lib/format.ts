export function formatInt(n: number): string {
  return new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(n);
}

export function formatPct(n: number): string {
  // accept 0..1 or 0..100
  const v = n <= 1 ? n * 100 : n;
  return `${new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 1 }).format(v)}%`;
}
