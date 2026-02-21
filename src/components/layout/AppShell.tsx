import { useEffect, useMemo, useState } from 'react';
import { Header } from './Header';
import { BannerSlider } from '../banner/BannerSlider';
import { DashboardSection } from '../dashboard/DashboardSection';
import { LeaderboardSection } from '../leaderboard/LeaderboardSection';
import { PlayerModal } from '../modal/PlayerModal';
import type { Player } from '../../types/player';
import { useAppSettings } from '../../context/AppSettingsContext';
import { fetchPlayersFromSheets } from '../../services/playersService';

export function AppShell() {
  const { dataSource } = useAppSettings();

  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    let alive = true;
    setLoadingPlayers(true);

    fetchPlayersFromSheets(dataSource)
      .then((items) => {
        if (!alive) return;
        setPlayers(items);
      })
      .catch(() => {
        if (!alive) return;
        setPlayers([]);
      })
      .finally(() => {
        if (!alive) return;
        setLoadingPlayers(false);
      });

    return () => {
      alive = false;
    };
  }, [dataSource]);

  const kpis = useMemo(() => {
    const countPlayers = players.length;
    const games = players.reduce((s, p) => s + p.games, 0);
    const avgElo = countPlayers > 0 ? players.reduce((s, p) => s + p.elo, 0) / countPlayers : 0;
    const topElo = countPlayers > 0 ? players[0].elo : 0;
    return { countPlayers, games, avgElo, topElo };
  }, [players]);

  return (
    <div className="app">
      <Header />
      <main className="container">
        <BannerSlider />
        <DashboardSection kpis={kpis} />
        <LeaderboardSection players={players} loading={loadingPlayers} onSelectPlayer={setSelectedPlayer} />
      </main>

      <PlayerModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
    </div>
  );
}
