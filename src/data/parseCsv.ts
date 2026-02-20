/**
 * Minimal CSV parser (RFC4180-ish) good enough for Google Sheets export.
 * - supports quoted fields with commas
 * - supports CRLF / LF
 *
 * Why not dependency? This keeps bundle smaller and logic inspectable.
 */
export function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  const pushCell = () => {
    row.push(cell);
    cell = "";
  };

  const pushRow = () => {
    // Trim trailing empty row.
    if (row.length === 1 && row[0] === "") {
      row = [];
      return;
    }
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (inQuotes) {
      if (ch === '"') {
        const next = input[i + 1];
        if (next === '"') {
          // Escaped quote
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }

    if (ch === ",") {
      pushCell();
      continue;
    }

    if (ch === "\n") {
      pushCell();
      pushRow();
      continue;
    }

    if (ch === "\r") {
      // skip CR; LF handles row break
      continue;
    }

    cell += ch;
  }

  pushCell();
  pushRow();

  return rows;
}
