import { AppShell } from './components/AppShell/AppShell';
import { DataSourceProvider } from './context/data-source-context';
import { ThemeProvider } from './context/theme-context';
import { DataProvider } from './context/data-context';

export default function App() {
  return (
    <ThemeProvider>
      <DataSourceProvider>
        <DataProvider>
          <AppShell />
        </DataProvider>
      </DataSourceProvider>
    </ThemeProvider>
  );
}
