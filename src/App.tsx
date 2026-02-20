import React from 'react';
import { ThemeProvider } from './lib/theme';
import { AppShell } from './components/AppShell';

export function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}
