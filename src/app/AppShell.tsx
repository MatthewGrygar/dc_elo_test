import { useEffect, useMemo, useState } from 'react'
import type { Player } from '../types/player'
import { loadStandings } from '../services/sheetsService'
import { useDataSource } from '../hooks/useDataSource'
import { Header } from '../components/header/Header'
import { BannerSlider } from '../components/banner/BannerSlider'
import { DashboardSection } from '../components/dashboard/DashboardSection'
import { LeaderboardSection } from '../components/leaderboard/LeaderboardSection'
import { PlayerModal } from '../components/player/PlayerModal'

export function AppShell() {
  const { dataSource } = useDataSource()

  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchedAt, setFetchedAt] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      setLoading(true)
      setError(null)
      try {
        const res = await loadStandings(dataSource)
        if (cancelled) return
        setPlayers(res.players)
        setFetchedAt(res.fetchedAt)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [dataSource])

  const kpis = useMemo(() => {
    const playerCount = players.length
    const gamesTotal = players.reduce((s, p) => s + p.games, 0)
    const eloAvg = playerCount ? players.reduce((s, p) => s + p.elo, 0) / playerCount : 0
    const topElo = players[0]?.elo ?? 0
    return {
      playerCount,
      gamesTotal,
      eloAvg,
      topElo
    }
  }, [players])

  return (
    <div className="app">
      <Header />
      <main className="appMain">
        <BannerSlider />

        <div className="container">
          <DashboardSection
            kpis={kpis}
            loading={loading}
            error={error}
            dataSource={dataSource}
          />

          <LeaderboardSection
            players={players}
            loading={loading}
            error={error}
            fetchedAt={fetchedAt}
          />
        </div>
      </main>

      <PlayerModal />
    </div>
  )
}
