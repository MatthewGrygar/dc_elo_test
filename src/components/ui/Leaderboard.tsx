import { useMemo, useState } from "react";
import { Player } from "../../types/player";
import { formatInt, formatPct } from "../../lib/format";

/**
 * Winrate color scale
 * - 0% => red
 * - 100% => green
 *
 * We return subtle, glass-friendly colors (bg + border) so it stays premium.
 */
function winrateStyle(winrate01: number): React.CSSProperties {
  const w = Math.max(0, Math.min(1, winrate01));
  // Hue 0 (red) -> 120 (green)
  const hue = 120 * w;

  // Keep it muted: use alpha backgrounds + slightly stronger border.
  const border = `hsla(${hue}, 85%, 55%, 0.45)`;
  const bg = `hsla(${hue}, 85%, 55%, 0.16)`;

  return { borderColor: border, background: bg, color: "var(--text)" };
}

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
              <span className="pill" style={winrateStyle(p.winrate)}>
                {formatPct(p.winrate)}
              </span>
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
