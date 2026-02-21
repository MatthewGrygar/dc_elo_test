import React from 'react';
import { Button } from '../common/Button';
import { useAppPreferences } from '../../context/AppPreferencesContext';

export function ThemeToggle() {
  const { themeMode, toggleThemeMode } = useAppPreferences();
  const isDark = themeMode === 'dark';

  return (
    <Button className="themeToggle" onClick={toggleThemeMode} aria-label="Přepnout téma">
      <span className="themeToggle__icons" aria-hidden="true">
        <span className={isDark ? 'icon is-on' : 'icon'}>☾</span>
        <span className={!isDark ? 'icon is-on' : 'icon'}>☀</span>
      </span>
      <span className="themeToggle__label">{isDark ? 'Tmavý' : 'Světlý'}</span>
    </Button>
  );
}
