import type { Player } from '../../types/player';

function fmt(n: number) {
  return Math.round(n).toLocaleString('cs-CZ');
}

export function PlayerRow({ player, onClick }: { player: Player; onClick: () => void }) {
  return (
    <button type="button" className="panel panel--row playerRow" onClick={onClick} role="listitem">
      <div className="playerRow__cell playerRow__rank">{player.rank}</div>
      <div className="playerRow__cell playerRow__name">{player.name}</div>
      <div className="playerRow__cell playerRow__elo">{fmt(player.elo)}</div>
      <div className="playerRow__cell">{fmt(player.games)}</div>
      <div className="playerRow__cell">{fmt(player.wins)}</div>
      <div className="playerRow__cell">{fmt(player.losses)}</div>
      <div className="playerRow__cell">{fmt(player.draws)}</div>
      <div className="playerRow__cell">{player.peak ? fmt(player.peak) : '—'}</div>
      <div className="playerRow__cell">{player.winrate ? `${player.winrate.toFixed(1)}%` : '—'}</div>
    </button>
  );
}
