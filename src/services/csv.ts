/**
 * Lightweight CSV parser that supports:
 * - comma separator
 * - quoted fields with escaped quotes
 * - CRLF/LF newlines
 *
 * It is intentionally dependency-free to keep the data layer simple.
 */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let i = 0;
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = '';
  };
  const pushRow = () => {
    // ignore trailing empty rows
    if (row.length > 1 || (row.length === 1 && row[0] !== '')) rows.push(row);
    row = [];
  };

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        const next = text[i + 1];
        if (next === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += ch;
      i += 1;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }

    if (ch === ',') {
      pushField();
      i += 1;
      continue;
    }

    if (ch === '\n') {
      pushField();
      pushRow();
      i += 1;
      continue;
    }

    if (ch === '\r') {
      // handle CRLF
      const next = text[i + 1];
      if (next === '\n') {
        pushField();
        pushRow();
        i += 2;
        continue;
      }
      pushField();
      pushRow();
      i += 1;
      continue;
    }

    field += ch;
    i += 1;
  }

  // finalize
  pushField();
  pushRow();

  return rows;
}

export function csvToObjects(text: string): Array<Record<string, string>> {
  const rows = parseCSV(text);
  if (rows.length === 0) return [];

  const header = rows[0].map((h) => h.trim());
  const out: Array<Record<string, string>> = [];

  for (const r of rows.slice(1)) {
    const obj: Record<string, string> = {};
    for (let idx = 0; idx < header.length; idx += 1) {
      obj[header[idx] ?? String(idx)] = (r[idx] ?? '').trim();
    }
    out.push(obj);
  }

  return out;
}
