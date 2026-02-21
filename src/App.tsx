import React from 'react';
import { AppShell } from './components/layout/AppShell';
import { AppPreferencesProvider } from './context/AppPreferencesContext';

export function App() {
  return (
    <AppPreferencesProvider>
      <AppShell />
    </AppPreferencesProvider>
  );
}
