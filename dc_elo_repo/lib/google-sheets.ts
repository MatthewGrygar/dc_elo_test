export type RatingMode = "elo" | "dcpr"

const SPREADSHEET_ID = "1y98bzsIRpVv0_cGNfbITapucO5A6izeEz5lTM92ZbIA"

// NOTE:
// Deployed as a static site (GitHub Pages) => fetch public Google Sheets data
// directly from the browser.
// CSV export endpoint supports selecting a sheet by name.
export function sheetCsvUrl(sheetName: string) {
  const params = new URLSearchParams({ tqx: "out:csv", sheet: sheetName })
  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?${params.toString()}`
}

// Minimal CSV parser that handles quotes and commas.
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const next = text[i + 1]

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        cell += ch
      }
      continue
    }

    if (ch === '"') {
      inQuotes = true
      continue
    }

    if (ch === ",") {
      row.push(cell)
      cell = ""
      continue
    }

    if (ch === "\n") {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ""
      continue
    }

    if (ch === "\r") continue
    cell += ch
  }

  if (cell.length || row.length) {
    row.push(cell)
    rows.push(row)
  }

  return rows
}

export function toNumber(v: string): number {
  const clean = (v ?? "")
    .toString()
    .trim()
    .replace(/\s/g, "")
    .replace(/%/g, "")
    .replace(/,/g, ".")
  const n = Number(clean)
  return Number.isFinite(n) ? n : 0
}
