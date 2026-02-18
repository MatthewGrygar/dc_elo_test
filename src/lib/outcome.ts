export type MatchOutcome = 'W' | 'L' | 'D' | 'U'

export function parseOutcome(result: unknown): MatchOutcome {
  const s = String(result ?? '').trim().toUpperCase()
  if (!s) return 'U'
  // Common encodings across sheets
  if (s.startsWith('W') || s === '1') return 'W'
  if (s.startsWith('L') || s === '0') return 'L'
  if (s.startsWith('D') || s === '0.5' || s === '½') return 'D'
  return 'U'
}
