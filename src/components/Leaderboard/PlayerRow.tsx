import React from 'react';
import type { Player } from '../../types/player';
import { formatNumber } from '../../utils/format';

export function PlayerRow({ player, onClick }: { player: Player; onClick: () => void }) {
  return (
    <button className="playerRow" onClick={onClick} role="listitem">
      <div className="td td--rank">{player.rank}</div>
      <div className="td td--name">{player.name}</div>
      <div className="td td--num">{formatNumber(player.elo)}</div>
      <div className="td td--num">{formatNumber(player.games)}</div>
      <div className="td td--num">{formatNumber(player.wins)}</div>
      <div className="td td--num">{formatNumber(player.losses)}</div>
      <div className="td td--num">{formatNumber(player.draws)}</div>
      <div className="td td--num">{formatNumber(player.peak)}</div>
      <div className="td td--num">{formatNumber(Math.round(player.winrate * 100))}%</div>
    </button>
  );
}
