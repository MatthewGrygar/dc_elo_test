export const SHEET_ID = '1y98bzsIRpVv0_cGNfbITapucO5A6izeEz5lTM92ZbIA'

export const SHEETS = {
  eloStandings: 'Elo standings',
  tournamentElo: 'Tournament_Elo',
  data: 'Data',
  playerCards: 'Player cards (CSV)',
  playerCardsTournament: 'Player cards (CSV) - Tournament',
  playerSummary: 'Player summary',
  playerSummaryTournament: 'Player summary - Tournament',
} as const

export function sheetCsvUrl(sheetName: string) {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`
}
