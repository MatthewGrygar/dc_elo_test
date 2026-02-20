import { AppShell } from "./components/shell/AppShell";
import { ThemeProvider } from "./components/theme/ThemeProvider";

/**
 * App root.
 * ThemeProvider drží stav tmavého/světlého režimu v jednom místě,
 * aby budoucí rozšíření (routing, settings, user prefs) bylo jednoduché.
 */
export function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}
