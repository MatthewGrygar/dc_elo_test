import type { DataSource } from '../types/app';

/**
 * Public CSV endpoints published from Google Sheets (File -> Share -> Publish to web -> CSV).
 *
 * Recommended approach:
 * - Put the CSV URL(s) into a .env.local file.
 * - Keep this file as a single switchboard for the app.
 */

export type SheetsConfig = {
  standingsCsvUrl: string;
};

const FALLBACK_ELO_URL =
  'https://docs.google.com/spreadsheets/d/e/REPLACE_ME/pub?gid=0&single=true&output=csv';
const FALLBACK_DCPR_URL =
  'https://docs.google.com/spreadsheets/d/e/REPLACE_ME/pub?gid=0&single=true&output=csv';

export function getSheetsConfig(source: DataSource): SheetsConfig {
  if (source === 'DCPR') {
    return {
      standingsCsvUrl: import.meta.env.VITE_DCPR_CSV_URL ?? FALLBACK_DCPR_URL
    };
  }

  return {
    standingsCsvUrl: import.meta.env.VITE_ELO_CSV_URL ?? FALLBACK_ELO_URL
  };
}
