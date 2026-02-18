import { AnimatePresence, motion } from 'framer-motion'
import React, { createContext, useContext, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

type ModalState = {
  open: boolean
  title?: string
  subtitle?: string
  content?: React.ReactNode
  fullscreen?: boolean
  size?: 'md' | 'lg' | 'xl' | '2xl'
  onClose?: () => void
}

type ModalApi = {
  openModal: (s: Omit<ModalState, 'open'>) => void
  closeModal: () => void
}

const Ctx = createContext<ModalApi | null>(null)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ModalState>({ open: false })

  const api = useMemo<ModalApi>(() => ({
    openModal: (s) => setState({ open: true, ...s }),
    closeModal: () => setState((prev) => { prev.onClose?.(); return { open: false } }),
  }), [])

  return (
    <Ctx.Provider value={api}>
      {children}
      <ModalView state={state} onClose={() => setState((prev) => { prev.onClose?.(); return { open: false } })} />
    </Ctx.Provider>
  )
}

export function useModal() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useModal must be used within ModalProvider')
  return v
}

function ModalView({ state, onClose }: { state: ModalState; onClose: () => void }) {
  if (typeof document === 'undefined') return null


  const sizeClass =
    state.size === 'md'
      ? 'max-w-xl'
      : state.size === 'lg'
      ? 'max-w-3xl'
      : state.size === 'xl'
      ? 'max-w-4xl'
      : state.size === '2xl'
      ? 'max-w-6xl'
      : 'max-w-3xl'
  return createPortal(
    <AnimatePresence>
      {state.open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            aria-label="Close"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            className={
              state.fullscreen
                ? 'relative z-10 h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-soft dark:border-white/10 dark:bg-slate-950'
                : `relative z-10 w-full ${sizeClass} overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-soft dark:border-white/10 dark:bg-slate-950`
            }
            initial={{ y: 22, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 22, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          >
            <div className="flex items-start gap-4 border-b border-slate-200/70 dark:border-white/10 px-5 py-4">
              <div className="min-w-0 flex-1">
                {state.title && <div className="text-lg font-semibold tracking-tight">{state.title}</div>}
                {state.subtitle && <div className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{state.subtitle}</div>}
              </div>
              <button
                className="rounded-xl border border-white/10 bg-white p-2 text-slate-700 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className={state.fullscreen ? 'h-[calc(92vh-64px)] overflow-auto' : 'max-h-[75vh] overflow-auto'}>
              <div className="px-5 py-5">{state.content}</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
