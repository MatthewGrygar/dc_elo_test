import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

export function Modal({
  isOpen,
  title,
  onClose,
  children
}: {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const root = document.getElementById('modal-root');
  if (!root) return null;

  return ReactDOM.createPortal(
    <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__panel panel panel--soft" role="document">
        <div className="modal__header">
          <div>
            <div className="modal__title">{title}</div>
            <div className="modal__subtitle">Klikni mimo okno nebo stiskni Esc pro zavření</div>
          </div>
          <button className="iconbtn" onClick={onClose} aria-label="Zavřít">
            ✕
          </button>
        </div>
        <div className="modal__content">{children}</div>
      </div>
    </div>,
    root
  );
}
