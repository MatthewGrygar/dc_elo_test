export function formatInt(n: number): string {
  return Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(n);
}

export function formatPct(n: number): string {
  return Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 1 }).format(n) + " %";
}
