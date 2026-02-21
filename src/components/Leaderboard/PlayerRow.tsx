import { useContext } from 'react';
import type { Player } from '../../types/player';
import { AppShellContext } from '../AppShell/AppShell';
import { formatElo, formatPercent01 } from '../../utils/format';

export function PlayerRow({ player }: { player: Player }) {
  const shell = useContext(AppShellContext);

  const onClick = () => shell?.openPlayer(player);

  return (
    <button type="button" className="lbRow lbRow--body" onClick={onClick}>
      <div className="lbCell lbCell--rank">{player.rank}</div>
      <div className="lbCell lbCell--name">{player.name}</div>
      <div className="lbCell lbCell--elo">{formatElo(player.elo)}</div>
      <div className="lbCell lbCell--num">{player.games}</div>
      <div className="lbCell lbCell--num">{player.wins}</div>
      <div className="lbCell lbCell--num">{player.losses}</div>
      <div className="lbCell lbCell--num">{player.draws}</div>
      <div className="lbCell lbCell--num">{formatElo(player.peak)}</div>
      <div className="lbCell lbCell--num">{formatPercent01(player.winrate)}</div>
    </button>
  );
}
