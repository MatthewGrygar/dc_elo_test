import { FixedSizeList as List } from 'react-window'
import AutoSizer from './AutoSizer'
import type { Player } from '../../types/player'
import { PlayerRow } from './PlayerRow'

const ROW_HEIGHT = 56

export function Leaderboard({ players, loading }: { players: Player[]; loading: boolean }) {
  return (
    <div className="panel panel--table">
      <div className="tableHeader">
        <div className="col col--rank">#</div>
        <div className="col col--name">Hráč</div>
        <div className="col col--elo">ELO</div>
        <div className="col col--num">Games</div>
        <div className="col col--num">W</div>
        <div className="col col--num">L</div>
        <div className="col col--num">D</div>
        <div className="col col--num">Peak</div>
        <div className="col col--num">Winrate</div>
      </div>

      <div className="tableBody" aria-busy={loading ? 'true' : 'false'}>
        {loading ? (
          <div className="tableLoading">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="playerRow skeleton" />
            ))}
          </div>
        ) : (
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={Math.max(320, height)}
                width={width}
                itemCount={players.length}
                itemSize={ROW_HEIGHT}
                itemData={players}
              >
                {PlayerRow}
              </List>
            )}
          </AutoSizer>
        )}
      </div>
    </div>
  )
}
