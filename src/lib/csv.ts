import Papa from 'papaparse'

export async function fetchCsv(url: string): Promise<string[][]> {
  const u = new URL(url)
  u.searchParams.set('_', Date.now().toString())
  const res = await fetch(u.toString())
  const text = await res.text()
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  if (text.trim().startsWith('<')) throw new Error('Expected CSV, got HTML')

  const parsed = Papa.parse<string[]>(text, {
    skipEmptyLines: true,
  })
  if (parsed.errors?.length) {
    throw new Error(parsed.errors[0]?.message || 'CSV parse error')
  }
  const data = parsed.data as unknown as string[][]
  return data
}

export function toNumber(v: unknown): number {
  if (v == null) return Number.NaN
  const s = String(v).trim().replace(/\s+/g, '')
  if (!s) return Number.NaN
  const n = Number(s.replace(',', '.'))
  return Number.isFinite(n) ? n : Number.NaN
}

export function normalizeKey(v: string) {
  return (v || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function baseSlugFromName(name: string) {
  const k = normalizeKey(name)
  return k.replace(/\s+/g, '-') || 'player'
}

export function buildDeterministicSlugs(names: string[]) {
  const used = new Map<string, number>()
  return names.map((n) => {
    const base = baseSlugFromName(n)
    const count = (used.get(base) || 0) + 1
    used.set(base, count)
    return count === 1 ? base : `${base}-${count}`
  })
}
