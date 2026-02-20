import { useEffect, useMemo, useState } from 'react';
import { BannerSlider } from '../components/BannerSlider';
import { ChartsSection } from '../components/ChartsSection';
import { PlayersTable } from '../components/PlayersTable';
import { SiteHeader } from '../components/SiteHeader';
import { StatsBar } from '../components/StatsBar';
import { fetchPlayersFromSheet, demoPlayers } from '../data/googleSheets';
import { useTheme } from '../hooks/useTheme';
import type { PlayerRow } from '../types/player';

export function App() {
  const { theme, toggle } = useTheme();

  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const rows = await fetchPlayersFromSheet(controller.signal);
        setPlayers(rows);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        setPlayers(demoPlayers);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const safePlayers = useMemo(() => (players.length > 0 ? players : demoPlayers), [players]);

  return (
    <div className="min-h-screen bg-aurora">
      <SiteHeader theme={theme} onToggleTheme={toggle} />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <BannerSlider />
        <StatsBar players={safePlayers} />
        <ChartsSection players={safePlayers} />
        <PlayersTable players={safePlayers} loading={loading} error={error} />

        <footer className="pb-10 pt-2 text-center text-xs text-[rgb(var(--muted))]">
          <p>
            DC ELO 2.0 — skeleton / placeholder UI. Data: Google Sheets (public). Build & deploy: GitHub Pages.
          </p>
        </footer>
      </main>
    </div>
  );
}
