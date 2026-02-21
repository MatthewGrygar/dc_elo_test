import { useAppSettings } from '../../context/AppSettingsContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppSettings();
  const isDark = theme === 'dark';

  return (
    <button className="toggle" type="button" onClick={toggleTheme} aria-label="Theme toggle">
      <span className="toggle__label">{isDark ? 'Tmavý' : 'Světlý'}</span>
      <span className="toggle__icons" aria-hidden="true">
        <span className={isDark ? 'icon icon--sun icon--off' : 'icon icon--sun'}>☀</span>
        <span className={isDark ? 'icon icon--moon' : 'icon icon--moon icon--off'}>☾</span>
      </span>
    </button>
  );
}
