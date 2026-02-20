import { useEffect, useMemo, useState } from "react";
import { applyTheme, getInitialTheme, toggleTheme, type Theme } from "../lib/theme";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { StatsRow } from "../components/StatsRow";
import { ChartsGrid } from "../components/ChartsGrid";
import { PlayersSection } from "../components/PlayersSection";

export function App() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const onToggleTheme = () => {
    setTheme((t) => {
      const next = toggleTheme(t);
      applyTheme(next);
      return next;
    });
  };

  const containerClass = useMemo(
    () =>
      "min-h-screen bg-[var(--bg)] text-[var(--text)] " +
      "selection:bg-[var(--ring)] selection:text-[var(--text)]",
    [],
  );

  return (
    <div className={containerClass}>
      <Header theme={theme} onToggleTheme={onToggleTheme} />

      <main className="mx-auto w-full max-w-6xl px-4 pb-24">
        <Hero />

        <div className="mt-8">
          <StatsRow />
        </div>

        <div className="mt-10">
          <ChartsGrid />
        </div>

        <div className="mt-12">
          <PlayersSection />
        </div>

        <footer className="mt-16 border-t border-[var(--border)] pt-6 text-sm text-[var(--muted)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <span>© {new Date().getFullYear()} NEW DC ELO</span>
            <span className="opacity-80">
              Skeleton v0.1 • další iterace: reálné grafy, filtry, cache
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
