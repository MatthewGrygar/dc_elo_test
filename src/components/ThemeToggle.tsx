import { Moon, Sun } from 'lucide-react';
import type { ThemeMode } from '../hooks/useTheme';

type Props = {
  theme: ThemeMode;
  onToggle: () => void;
};

export function ThemeToggle({ theme, onToggle }: Props) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-2 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))]/70 px-4 py-2 text-sm font-medium shadow-soft backdrop-blur transition hover:translate-y-[-1px]"
      aria-label={isDark ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}
      title={isDark ? 'Světlý režim' : 'Tmavý režim'}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
      <span>{isDark ? 'Světlý' : 'Tmavý'}</span>
    </button>
  );
}
