/**
 * Minimal CSV parsing for Google Sheets "Publish to web".
 * Supports quoted fields and commas inside quotes.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]

    if (inQuotes) {
      if (c === '"') {
        const next = text[i + 1]
        if (next === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
      continue
    }

    if (c === '"') {
      inQuotes = true
      continue
    }

    if (c === ',') {
      row.push(field)
      field = ''
      continue
    }

    if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      continue
    }

    if (c === '\r') continue

    field += c
  }

  // last cell
  row.push(field)
  rows.push(row)

  // Trim potential empty trailing line
  if (rows.length && rows[rows.length - 1].every((x) => x.trim() === '')) rows.pop()

  return rows
}

export function normalizeHeaderKey(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, '_')
}
