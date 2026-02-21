import type { Player } from '../../types/player'
import { Leaderboard } from './Leaderboard'

export function LeaderboardSection({
  players,
  loading,
  error,
  fetchedAt
}: {
  players: Player[]
  loading: boolean
  error: string | null
  fetchedAt: string | null
}) {
  return (
    <section id="leaderboard" className="section">
      <div className="sectionHeader">
        <h2 className="sectionTitle">Leaderboard</h2>
        <div className="sectionHint">
          {loading ? (
            <span className="muted">Načítám…</span>
          ) : error ? (
            <span className="muted">Chyba načítání</span>
          ) : fetchedAt ? (
            <span className="muted">Aktualizováno: {new Date(fetchedAt).toLocaleString('cs-CZ')}</span>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="panel panel--soft notice">
          <div className="noticeTitle">Leaderboard není dostupný</div>
          <div className="noticeBody">{error}</div>
        </div>
      ) : (
        <Leaderboard players={players} loading={loading} />
      )}
    </section>
  )
}
