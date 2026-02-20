/**
 * PlayerRow is the normalized shape used throughout the app.
 * Source columns are from Google Sheet:
 * A Name, B Rating, C Games, D Win, E Loss, F Draw, G Winrate, H Peak
 */
export type PlayerRow = {
  name: string;
  rating: number;
  games: number;
  win: number;
  loss: number;
  draw: number;
  winrate: number; // percentage (0-100)
  peak: number;
};
