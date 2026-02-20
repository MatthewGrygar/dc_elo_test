import React from 'react';
import type { PlayerRow } from '../types/player';

type SortKey = 'rating' | 'games' | 'winrate' | 'peak';

export function Leaderboard({
  players,
  isLoading,
  onSelect
}: {
  players: PlayerRow[];
  isLoading: boolean;
  onSelect: (p: PlayerRow) => void;
}) {
  const [query, setQuery] = React.useState('');
  const [sort, setSort] = React.useState<SortKey>('rating');

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q ? players.filter((p) => p.name.toLowerCase().includes(q)) : players;

    const copy = [...base];
    copy.sort((a, b) => b[sort] - a[sort]);
    return copy;
  }, [players, query, sort]);

  return (
    <div className="panel leaderboard">
      <div className="leaderboardToolbar">
        <div className="search">
          <span className="searchIcon" aria-hidden>
            ⌕
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search player…"
            aria-label="Search player"
          />
        </div>

        <div className="sort">
          <span className="muted">Sort:</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort">
            <option value="rating">Rating</option>
            <option value="games">Games</option>
            <option value="winrate">Winrate</option>
            <option value="peak">Peak</option>
          </select>
        </div>
      </div>

      <div className="leaderboardHead" role="row">
        <span className="muted">#</span>
        <span className="muted">Player</span>
        <span className="muted right">Rating</span>
        <span className="muted right">Games</span>
        <span className="muted right">W</span>
        <span className="muted right">L</span>
        <span className="muted right">D</span>
        <span className="muted right">Peak</span>
        <span className="muted right">WR</span>
      </div>

      <div className="leaderboardBody" role="rowgroup">
        {isLoading ? (
          <LoadingRows />
        ) : filtered.length === 0 ? (
          <div className="empty muted">No players found.</div>
        ) : (
          filtered.map((p, idx) => (
            <button
              key={p.id}
              className={idx < 3 ? 'playerRow isTop' : 'playerRow'}
              onClick={() => onSelect(p)}
              type="button"
            >
              <span className="rank">{idx + 1}</span>
              <span className="name">{p.name}</span>
              <span className="right mono">{p.rating}</span>
              <span className="right mono">{p.games}</span>
              <span className="right mono">{p.win}</span>
              <span className="right mono">{p.loss}</span>
              <span className="right mono">{p.draw}</span>
              <span className="right mono">{p.peak}</span>
              <span className="right mono">
                {Number.isFinite(p.winrate) && p.winrate !== 0 ? `${round(p.winrate)}%` : '—'}
              </span>
            </button>
          ))
        )}
      </div>

      <div className="leaderboardFooter muted">
        Tip: click a player row to open a modal placeholder (future: match history, commander stats).
      </div>
    </div>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="playerRow skeleton" aria-hidden>
          <span className="rank">&nbsp;</span>
          <span className="name">&nbsp;</span>
          <span className="right mono">&nbsp;</span>
          <span className="right mono">&nbsp;</span>
          <span className="right mono">&nbsp;</span>
          <span className="right mono">&nbsp;</span>
          <span className="right mono">&nbsp;</span>
          <span className="right mono">&nbsp;</span>
          <span className="right mono">&nbsp;</span>
        </div>
      ))}
    </>
  );
}

function round(n: number) {
  return Math.round(n * 10) / 10;
}
