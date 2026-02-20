import { useEffect, useMemo, useState } from "react";
import { fetchPlayersFromGoogleSheet } from "../../data/googleSheet";
import { fallbackPlayers } from "../../data/fallbackPlayers";
import { Player } from "../../types/player";
import { Header } from "../ui/Header";
import { BannerSlider } from "../ui/BannerSlider";
import { DashboardSection } from "../ui/DashboardSection";
import { LeaderboardSection } from "../ui/LeaderboardSection";
import { PlayerModal } from "../ui/PlayerModal";

/**
 * AppShell orchestrates data + high-level layout.
 *
 * Why keep data fetching here?
 * - in future we'll add more sections sharing same dataset (metagame, match history)
 * - avoids prop drilling by keeping "page state" at a single place
 */
export function AppShell() {
  const [players, setPlayers] = useState<Player[]>(fallbackPlayers);
  const [dataSource, setDataSource] = useState<"google-sheet" | "fallback">("fallback");

  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch once on load; graceful fallback keeps UI usable.
    fetchPlayersFromGoogleSheet()
      .then((p) => {
        if (p.length > 0) {
          setPlayers(p);
          setDataSource("google-sheet");
        }
      })
      .catch(() => {
        setPlayers(fallbackPlayers);
        setDataSource("fallback");
      });
  }, []);

  const selectedPlayer = useMemo(
    () => players.find((p) => p.id === selectedPlayerId) ?? null,
    [players, selectedPlayerId],
  );

  return (
    <div className="page">
      <Header />
      <main className="content">
        <BannerSlider dataSource={dataSource} />
        <DashboardSection players={players} />
        <LeaderboardSection players={players} onSelectPlayer={(id) => setSelectedPlayerId(id)} />
      </main>

      <PlayerModal player={selectedPlayer} onClose={() => setSelectedPlayerId(null)} />
    </div>
  );
}
