import type { DataSource } from '../types/core'

export type SheetsConfig = {
  csvUrlBySource: Record<DataSource, string>
}

export const sheetsConfig: SheetsConfig = {
  csvUrlBySource: {
    ELO:
      import.meta.env.VITE_SHEETS_ELO_CSV_URL ??
      // Safe fallback (demo mode). Replace via .env / GitHub Secrets.
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vSAMPLE/pub?output=csv',
    DCPR:
      import.meta.env.VITE_SHEETS_DCPR_CSV_URL ??
      // Placeholder: points to same fallback, so the toggle still works in demo.
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vSAMPLE/pub?output=csv'
  }
}
