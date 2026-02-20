import { useMemo, useState } from "react";
import { Player } from "../../types/player";
import { formatInt, formatPct } from "../../lib/format";

type SortKey = "rating" | "games" | "winrate" | "peak";

function compare(a: Player, b: Player, key: SortKey): number {
  return (b[key] as number) - (a[key] as number);
}

export function Leaderboard({
  players,
  onSelectPlayer,
}: {
  players: Player[];
  onSelectPlayer: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("rating");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? players.filter((p) => p.name.toLowerCase().includes(q)) : players;
    return [...list].sort((a, b) => compare(a, b, sortKey));
  }, [players, query, sortKey]);

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

        <div className="segmented">
          <button
            className={`segBtn ${sortKey === "rating" ? "segBtn--active" : ""}`}
            onClick={() => setSortKey("rating")}
            type="button"
          >
            Rating
          </button>
          <button
            className={`segBtn ${sortKey === "winrate" ? "segBtn--active" : ""}`}
            onClick={() => setSortKey("winrate")}
            type="button"
          >
            Winrate
          </button>
          <button
            className={`segBtn ${sortKey === "games" ? "segBtn--active" : ""}`}
            onClick={() => setSortKey("games")}
            type="button"
          >
            Games
          </button>
          <button
            className={`segBtn ${sortKey === "peak" ? "segBtn--active" : ""}`}
            onClick={() => setSortKey("peak")}
            type="button"
          >
            Peak
          </button>
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
            className="row row--item"
            role="row"
            onClick={() => onSelectPlayer(p.id)}
            type="button"
          >
            <div className="cell cell--rank" role="cell">
              <span className={`rankBadge ${i < 3 ? "rankBadge--top" : ""}`}>#{i + 1}</span>
            </div>

            <div className="cell cell--name" role="cell">
              <div className="nameMain">{p.name}</div>
              <div className="nameSub">Klik pro detail</div>
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

        {filtered.length === 0 && (
          <div className="empty">
            Nic nenalezeno. Zkus jiný dotaz.
          </div>
        )}
      </div>
    </div>
  );
}
