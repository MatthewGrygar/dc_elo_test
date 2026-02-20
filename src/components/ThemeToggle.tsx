import React from 'react';
import { Moon, Sun } from 'lucide-react';
import type { Theme } from '@/types/dc';

export function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: Theme;
  onToggle: () => void;
}) {
  const label = theme === 'light' ? 'Světlý' : 'Tmavý';

  return (
    <button
      className="themeToggle"
      onClick={onToggle}
      type="button"
      aria-label="Přepnout režim"
      title="Přepnout režim"
    >
      <span className="themeToggleLabel">{label}</span>
      <span className="themeToggleTrack" aria-hidden="true">
        <span className="themeToggleThumb">
          <span className="iconSun">
            <Sun size={14} />
          </span>
          <span className="iconMoon">
            <Moon size={14} />
          </span>
        </span>
      </span>
    </button>
  );
}
