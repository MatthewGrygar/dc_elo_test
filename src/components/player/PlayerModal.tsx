import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useModal } from '../../hooks/useModal'
import { formatNumber, formatPercent } from '../../utils/format'

export function PlayerModal() {
  const { selectedPlayer, close } = useModal()

  useEffect(() => {
    if (!selectedPlayer) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedPlayer, close])

  if (!selectedPlayer) return null

  const p = selectedPlayer

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true" aria-label="Detail hráče">
      <div className="modalBackdrop" onClick={close} />

      <div className="modal panel panel--modal" role="document">
        <div className="modalHeader">
          <div>
            <div className="modalTitle">{p.name}</div>
            <div className="modalSub">Duel Commander standings detail</div>
          </div>

          <button className="iconBtn" onClick={close} aria-label="Zavřít">
            <X size={18} />
          </button>
        </div>

        <div className="modalHero">
          <div className="modalElo">
            <div className="modalEloValue">{formatNumber(p.elo)}</div>
            <div className="modalEloLabel">Aktuální ELO</div>
          </div>

          <div className="modalStats">
            <Stat label="Games" value={formatNumber(p.games)} />
            <Stat label="Wins" value={formatNumber(p.wins)} />
            <Stat label="Losses" value={formatNumber(p.losses)} />
            <Stat label="Draws" value={formatNumber(p.draws)} />
            <Stat label="Peak" value={formatNumber(p.peak)} />
            <Stat label="Winrate" value={formatPercent(p.winrate)} />
          </div>
        </div>

        <div className="modalBody">
          <div className="panel panel--soft notice">
            <div className="noticeTitle">Graf a historie</div>
            <div className="noticeBody">
              Tady bude později detailní historie ELO / turnajů (např. line chart), metagame a poslední
              zápasy.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <div className="statLabel">{label}</div>
      <div className="statValue">{value}</div>
    </div>
  )
}
