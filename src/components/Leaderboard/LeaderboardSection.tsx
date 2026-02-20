import { useMemo, useState } from "react";
import { usePlayers } from "../../hooks/usePlayers";
import type { PlayerRow } from "../../types/player";
import { Leaderboard } from "./Leaderboard";
import { PlayerModal } from "./PlayerModal";

export function LeaderboardSection() {
  const { state } = usePlayers();
  const [selected, setSelected] = useState<PlayerRow | null>(null);

  const subtitle = useMemo(() => {
    if (state.status === "loading") return "Načítám hráče z Google Sheet…";
    if (state.status === "error") return `Chyba: ${state.error}`;
    return `${state.players.length} hráčů • seřazeno podle Rating`;
  }, [state]);

  return (
    <section id="leaderboard" className="section">
      <div className="container">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <h2 style={{ margin: "0 0 10px", fontSize: 18, letterSpacing: "-0.01em" }}>
            Leaderboard
          </h2>
          <div className="muted" style={{ fontSize: 13 }}>
            {subtitle}
          </div>
        </div>

        <Leaderboard
          players={state.players}
          loading={state.status === "loading"}
          onSelectPlayer={setSelected}
        />

        {selected && <PlayerModal player={selected} onClose={() => setSelected(null)} />}
      </div>
    </section>
  );
}
