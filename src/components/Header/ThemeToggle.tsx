import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const reducedMotion = usePrefersReducedMotion()

  const isDark = theme === 'dark'

  return (
    <button
      className="toggle panel panel--interactive toggle--fixed"
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}
    >
      <span className="toggleLabel">{isDark ? 'Tmavý' : 'Světlý'}</span>

      <span className="toggleIcon" aria-hidden="true" data-reduced={reducedMotion ? 'true' : 'false'}>
        <Sun className="toggleIconItem toggleIconItem--sun" />
        <Moon className="toggleIconItem toggleIconItem--moon" />
      </span>
    </button>
  )
}
