import React, { useMemo } from 'react';
import { FixedSizeList as List, type ListChildComponentProps } from 'react-window';
import type { Player } from '../../types/player';
import { PlayerRow } from './PlayerRow';

type RowData = {
  players: Player[];
  onSelect: (p: Player) => void;
};

function Row({ index, style, data }: ListChildComponentProps<RowData>) {
  const p = data.players[index];
  return (
    <div style={style}>
      <PlayerRow player={p} onClick={() => data.onSelect(p)} />
    </div>
  );
}

export function LeaderboardTable({
  players,
  isLoading,
  onSelectPlayer
}: {
  players: Player[];
  isLoading: boolean;
  onSelectPlayer: (p: Player) => void;
}) {
  const rowData = useMemo<RowData>(() => ({ players, onSelect: onSelectPlayer }), [players, onSelectPlayer]);

  return (
    <div className="tableWrap" aria-label="Žebříček hráčů">
      <div className="tableHeader">
        <div className="th th--rank">#</div>
        <div className="th th--name">Hráč</div>
        <div className="th">ELO</div>
        <div className="th">Games</div>
        <div className="th">W</div>
        <div className="th">L</div>
        <div className="th">D</div>
        <div className="th">Peak</div>
        <div className="th">Winrate</div>
      </div>

      <div className="tableBody" role="list">
        {isLoading ? (
          <div className="tableLoading">Načítám data z Google Sheets…</div>
        ) : players.length === 0 ? (
          <div className="tableEmpty">Žádní hráči k zobrazení.</div>
        ) : (
          <List
            height={520}
            width={'100%'}
            itemCount={players.length}
            itemSize={56}
            itemData={rowData}
          >
            {Row}
          </List>
        )}
      </div>
    </div>
  );
}
