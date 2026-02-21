import React, { createContext, useCallback, useMemo, useState } from 'react'
import type { PlayerDetail } from '../types/player'

export type ModalContextValue = {
  selectedPlayer: PlayerDetail | null
  openPlayer: (p: PlayerDetail) => void
  close: () => void
}

export const ModalContext = createContext<ModalContextValue | null>(null)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDetail | null>(null)

  const openPlayer = useCallback((p: PlayerDetail) => setSelectedPlayer(p), [])
  const close = useCallback(() => setSelectedPlayer(null), [])

  const value = useMemo<ModalContextValue>(() => ({ selectedPlayer, openPlayer, close }), [selectedPlayer, openPlayer, close])

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
}
