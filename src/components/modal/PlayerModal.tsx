import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import type { Player } from '../../types/player';
import { PlayerModalContent } from './PlayerModalContent';

export function PlayerModal({ player, onClose }: { player: Player | null; onClose: () => void }) {
  const open = !!player;
  const portalRoot = document.getElementById('modal-root');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!portalRoot || !open || !player) return null;

  return ReactDOM.createPortal(
    <div className="modal" role="dialog" aria-modal="true" aria-label="Player details">
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__panel panel">
        <PlayerModalContent player={player} onClose={onClose} />
      </div>
    </div>,
    portalRoot
  );
}
