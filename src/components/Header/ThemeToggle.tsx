import { useTheme } from '../../hooks/useTheme';

function SunIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={"toggle__icon " + (active ? 'isActive' : '')}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={"toggle__icon " + (active ? 'isActive' : '')}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M21 14.2A8 8 0 1 1 9.8 3a6.5 6.5 0 0 0 11.2 11.2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button className="toggle" type="button" onClick={toggleTheme} aria-label="Přepnout světlý/tmavý režim">
      <span className="toggle__label">{isDark ? 'Tmavý' : 'Světlý'}</span>
      <span className="toggle__icons" aria-hidden="true">
        <SunIcon active={!isDark} />
        <MoonIcon active={isDark} />
      </span>
    </button>
  );
}
