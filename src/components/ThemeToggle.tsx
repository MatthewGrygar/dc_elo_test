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
      className="inline-flex items-center gap-2 glass-chip ui-hover px-4 py-2 text-sm font-semibold"
      aria-label={isDark ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}
      title={isDark ? 'Světlý režim' : 'Tmavý režim'}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
      <span>{isDark ? 'Světlý' : 'Tmavý'}</span>
    </button>
  );
}
