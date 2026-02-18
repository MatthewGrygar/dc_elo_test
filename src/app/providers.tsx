import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nProvider } from '../features/i18n/i18n'
import { ThemeProvider } from './theme'
import { ModalProvider } from '../features/modal/Modal'
import { EloModeProvider } from '../features/elo/mode'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <ThemeProvider>
          <ModalProvider>
            <EloModeProvider>{children}</EloModeProvider>
          </ModalProvider>
        </ThemeProvider>
      </I18nProvider>
    </QueryClientProvider>
  )
}
