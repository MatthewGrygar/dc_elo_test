export type Player = {
  rank: number
  name: string
  elo: number
  games: number
  wins: number
  losses: number
  draws: number
  peak: number
  winrate: number // 0..1
}

export type PlayerDetail = Player & {
  // Future-ready: place for per-player timeline points etc.
  history?: Array<{ date: string; elo: number }>
}
