export type Player = {
  /** Stable key – for sheet we currently use name; later can be an explicit ID column. */
  id: string;
  name: string;
  rating: number;
  games: number;
  win: number;
  loss: number;
  draw: number;
  /** In percent (0–100). */
  winrate: number;
  peak: number;
};
