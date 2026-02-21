import Papa from 'papaparse';

export type CsvRow = Record<string, string>;

export async function fetchCsvRows(csvUrl: string, signal?: AbortSignal): Promise<CsvRow[]> {
  const res = await fetch(csvUrl, { signal, headers: { Accept: 'text/csv' } });
  if (!res.ok) {
    throw new Error(`CSV request failed: ${res.status} ${res.statusText}`);
  }
  const text = await res.text();

  const parsed = Papa.parse<CsvRow>(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false
  });

  if (parsed.errors?.length) {
    // Keep parsing resilient; report first error for diagnostics.
    const first = parsed.errors[0];
    throw new Error(`CSV parse error: ${first.message} (row: ${first.row})`);
  }

  return parsed.data ?? [];
}
