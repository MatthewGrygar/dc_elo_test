import { Player } from "../../types/player";
import { Leaderboard } from "./Leaderboard";

export function LeaderboardSection({
  players,
  onSelectPlayer,
}: {
  players: Player[];
  onSelectPlayer: (id: string) => void;
}) {
  return (
    <section id="leaderboard" className="section">
      <div className="sectionHeader">
        <h2 className="sectionTitle">Leaderboard</h2>
        <p className="sectionSubtitle">Seznam hráčů z Google Sheet (nebo fallback).</p>
      </div>

      <div className="panel">
        <Leaderboard players={players} onSelectPlayer={onSelectPlayer} />
      </div>
    </section>
  );
}
