import { useTheme } from '../lib/theme';

export function ThemeToggle() {
  const { mode, toggle } = useTheme();

  return (
    <button className="btn btn--primary" onClick={toggle} type="button" aria-label="Toggle theme">
      <span className="btnIcon" aria-hidden>
        {mode === 'dark' ? '☾' : '☀'}
      </span>
      <span className="btnLabel">{mode === 'dark' ? 'Dark' : 'Light'}</span>
    </button>
  );
}
