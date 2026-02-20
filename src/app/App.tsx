import React from 'react';
import { AppStateProvider, useAppState } from '@/app/state';
import { useStandings } from '@/app/useStandings';
import { AppShell } from '@/components/AppShell';

function AppInner() {
  const { dataSource } = useAppState();
  const standings = useStandings(dataSource);
  return <AppShell standings={standings} />;
}

export function App() {
  return (
    <AppStateProvider>
      <AppInner />
    </AppStateProvider>
  );
}
