import * as React from "react";
import type { PlayerStanding } from '@/types/dc';
import { List as List, type ListChildComponentProps } from "react-window";

function formatPct(v: number) {
  if (!Number.isFinite(v)) return '0%';
  return `${Math.round(v * 100)}%`;
}

type RowData = {
  players: PlayerStanding[];
  onSelect: (p: PlayerStanding) => void;
};

function Row({ index, style, data }: ListChildComponentProps<RowData>) {
  const p = data.players[index];

  return (
    <button
      className="playerRow panel panel--row"
      style={style}
      type="button"
      onClick={() => data.onSelect(p)}
    >
      <div className="cell rank">#{index + 1}</div>
      <div className="cell name">{p.name}</div>
      <div className="cell elo">{p.rating}</div>
      <div className="cell games">{p.games}</div>
      <div className="cell wl">
        {p.win}/{p.loss}/{p.draw}
      </div>
      <div className="cell winrate">{formatPct(p.winrate)}</div>
      <div className="cell peak">{p.peak || '—'}</div>
    </button>
  );
}

export function LeaderboardTable({
  players,
  isLoading,
  onSelectPlayer,
}: {
  players: PlayerStanding[];
  isLoading: boolean;
  onSelectPlayer: (p: PlayerStanding) => void;
}) {
  const height = 560;
  const rowHeight = 54;

  const itemData = React.useMemo<RowData>(
    () => ({ players, onSelect: onSelectPlayer }),
    [players, onSelectPlayer],
  );

  return (
    <div className="panel leaderboardPanel">
      <div className="tableHeader" role="row">
        <div className="th rank">#</div>
        <div className="th name">Hráč</div>
        <div className="th elo">Rating</div>
        <div className="th games">Games</div>
        <div className="th wl">W/L/D</div>
        <div className="th winrate">Winrate</div>
        <div className="th peak">Peak</div>
      </div>

      {isLoading ? (
        <div className="tableLoading">Načítám data…</div>
      ) : players.length === 0 ? (
        <div className="tableLoading">Žádní hráči</div>
      ) : (
        <List
          height={height}
          width="100%"
          itemCount={players.length}
          itemSize={rowHeight}
          itemData={itemData}
          overscanCount={8}
        >
          {Row}
        </List>
      )}
    </div>
  );
}
