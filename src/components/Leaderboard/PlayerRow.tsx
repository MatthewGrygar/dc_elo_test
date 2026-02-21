import type { ListChildComponentProps } from 'react-window'
import type { Player } from '../../types/player'
import { formatNumber, formatPercent } from '../../utils/format'
import { useModal } from '../../hooks/useModal'

export function PlayerRow({ index, style, data }: ListChildComponentProps<Player[]>) {
  const player = data[index]
  const { openPlayer } = useModal()

  return (
    <div
      className="playerRow panel panel--row panel--interactive"
      style={style}
      role="button"
      tabIndex={0}
      onClick={() => openPlayer(player)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') openPlayer(player)
      }}
      aria-label={`Otevřít detail hráče ${player.name}`}
    >
      <div className="col col--rank">{player.rank}</div>
      <div className="col col--name">
        <div className="playerName">{player.name}</div>
      </div>
      <div className="col col--elo">
        <span className="eloPill">{formatNumber(player.elo)}</span>
      </div>
      <div className="col col--num">{formatNumber(player.games)}</div>
      <div className="col col--num">{formatNumber(player.wins)}</div>
      <div className="col col--num">{formatNumber(player.losses)}</div>
      <div className="col col--num">{formatNumber(player.draws)}</div>
      <div className="col col--num">{formatNumber(player.peak)}</div>
      <div className="col col--num">
        <span className="muted">{formatPercent(player.winrate)}</span>
      </div>
    </div>
  )
}
