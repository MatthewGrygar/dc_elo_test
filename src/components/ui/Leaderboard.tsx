import { useMemo, useState } from "react";
import { Player } from "../../types/player";
import { formatInt, formatPct } from "../../lib/format";

export function Leaderboard({
  players,
  onSelectPlayer,
}: {
  players: Player[];
  onSelectPlayer: (id: string) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? players.filter((p) => p.name.toLowerCase().includes(q)) : players;
  }, [players, query]);

  return (
    <div className="leaderboard">
      <div className="leaderboardToolbar">
        <div className="search">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hledat hráče…"
            className="input"
          />
        </div>
      </div>

      <div className="tableWrap" role="table" aria-label="Players leaderboard">
        <div className="row row--head" role="row">
          <div className="cell cell--rank" role="columnheader">
            #
          </div>
          <div className="cell cell--name" role="columnheader">
            Hráč
          </div>
          <div className="cell" role="columnheader">
            Rating
          </div>
          <div className="cell" role="columnheader">
            Games
          </div>
          <div className="cell" role="columnheader">
            W-L-D
          </div>
          <div className="cell" role="columnheader">
            Winrate
          </div>
          <div className="cell" role="columnheader">
            Peak
          </div>
        </div>

        {filtered.map((p, i) => (
          <button
            key={p.id}
            className="panel panel--row row row--item"
            role="row"
            onClick={() => onSelectPlayer(p.id)}
            type="button"
          >
            <div className="cell cell--rank" role="cell">
              <span className={`rankBadge ${i < 3 ? "rankBadge--top" : ""}`}>#{i + 1}</span>
            </div>

            <div className="cell cell--name" role="cell">
              <div className="nameMain">{p.name}</div>
            </div>

            <div className="cell" role="cell">
              <span className="mono">{formatInt(p.rating)}</span>
            </div>
            <div className="cell" role="cell">
              <span className="mono">{formatInt(p.games)}</span>
            </div>
            <div className="cell" role="cell">
              <span className="mono">
                {formatInt(p.win)}-{formatInt(p.loss)}-{formatInt(p.draw)}
              </span>
            </div>
            <div className="cell" role="cell">
              <span className="pill pill--ok">{formatPct(p.winrate)}</span>
            </div>
            <div className="cell" role="cell">
              <span className="mono">{formatInt(p.peak)}</span>
            </div>
          </button>
        ))}

        {filtered.length === 0 && <div className="empty">Nic nenalezeno. Zkus jiný dotaz.</div>}
      </div>
    </div>
  );
}
