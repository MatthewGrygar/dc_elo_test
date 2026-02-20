import { Gauge } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import type { ThemeMode } from '../hooks/useTheme';

type Props = {
  theme: ThemeMode;
  onToggleTheme: () => void;
};

export function SiteHeader({ theme, onToggleTheme }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg))]/75 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))]/70 p-2 shadow-soft">
            <Gauge size={18} />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-extrabold tracking-tight">DC ELO 2.0</p>
            <p className="text-xs text-[rgb(var(--muted))]">Test / GitHub Pages</p>
          </div>
        </div>

        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  );
}
