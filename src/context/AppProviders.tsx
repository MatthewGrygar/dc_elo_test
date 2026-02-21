import { DataSourceProvider } from './DataSourceContext'
import { ModalProvider } from './ModalContext'
import { ThemeProvider } from './ThemeContext'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <DataSourceProvider>
        <ModalProvider>{children}</ModalProvider>
      </DataSourceProvider>
    </ThemeProvider>
  )
}
