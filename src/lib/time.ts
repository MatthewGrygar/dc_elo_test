export function formatRelativeTime(ts: number): string {
  const deltaMs = Date.now() - ts;
  const deltaSec = Math.max(0, Math.floor(deltaMs / 1000));

  if (deltaSec < 10) return 'just now';
  if (deltaSec < 60) return `${deltaSec}s ago`;

  const deltaMin = Math.floor(deltaSec / 60);
  if (deltaMin < 60) return `${deltaMin}m ago`;

  const deltaH = Math.floor(deltaMin / 60);
  if (deltaH < 24) return `${deltaH}h ago`;

  const deltaD = Math.floor(deltaH / 24);
  return `${deltaD}d ago`;
}
