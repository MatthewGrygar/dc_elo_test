import { createContext, useContext, useMemo, useState } from 'react'

export type EloMode = 'elo' | 'dcpr'

type Ctx = {
  mode: EloMode
  setMode: (m: EloMode) => void
}

const ModeContext = createContext<Ctx | null>(null)

export function EloModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<EloMode>('elo')
  const value = useMemo(() => ({ mode, setMode }), [mode])
  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>
}

export function useEloMode() {
  const ctx = useContext(ModeContext)
  if (!ctx) throw new Error('useEloMode must be used within EloModeProvider')
  return ctx
}
