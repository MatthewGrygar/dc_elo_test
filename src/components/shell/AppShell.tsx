import { useEffect, useMemo, useState } from "react";
import { fetchPlayersFromGoogleSheet } from "../../data/googleSheet";
import { fallbackPlayers } from "../../data/fallbackPlayers";
import { Player } from "../../types/player";
import { Header } from "../ui/Header";
import { BannerSlider } from "../ui/BannerSlider";
import { DashboardSection } from "../ui/DashboardSection";
import { LeaderboardSection } from "../ui/LeaderboardSection";
import { PlayerModal } from "../ui/PlayerModal";
import type { StandingsSource } from "../ui/DataSourceToggle";

/**
 * AppShell orchestrates:
 * - layout
 * - data fetching (single source of truth)
 * - modal selection state
 */
export function AppShell() {
  const [players, setPlayers] = useState<Player[]>(fallbackPlayers);
  const [dataStatus, setDataStatus] = useState<"google-sheet" | "fallback">("fallback");
  const [standingsSource, setStandingsSource] = useState<StandingsSource>("ELO");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  useEffect(() => {
    const sheetName = standingsSource === "ELO" ? "Elo standings" : "Tournament_Elo";

    fetchPlayersFromGoogleSheet(sheetName)
      .then((p) => {
        if (p.length > 0) {
          setPlayers(p);
          setDataStatus("google-sheet");
        } else {
          setPlayers(fallbackPlayers);
          setDataStatus("fallback");
        }
      })
      .catch(() => {
        setPlayers(fallbackPlayers);
        setDataStatus("fallback");
      });
  }, [standingsSource]);

  const selectedPlayer = useMemo(
    () => players.find((p) => p.id === selectedPlayerId) ?? null,
    [players, selectedPlayerId],
  );

  return (
    <div className="page">
      <Header standingsSource={standingsSource} onStandingsSourceChange={setStandingsSource} />
      <main className="content">
        <BannerSlider dataSource={dataStatus} />
        <DashboardSection players={players} />
        <LeaderboardSection players={players} onSelectPlayer={(id) => setSelectedPlayerId(id)} />
      </main>
      <PlayerModal player={selectedPlayer} onClose={() => setSelectedPlayerId(null)} />
    </div>
  );
}
