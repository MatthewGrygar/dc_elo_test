export function formatNumber(value: number, opts?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat('cs-CZ', opts).format(value);
}

export function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}
