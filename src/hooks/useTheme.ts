import { useCallback, useMemo, useState } from "react";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "dc-elo.theme";

/**
 * Theme handling is kept in a tiny hook:
 * - reads localStorage once
 * - exposes (theme, toggle, setTheme)
 *
 * The actual CSS variables are in `globals.css` and applied via `data-theme` on <html>.
 */
export function useTheme() {
  const initial = useMemo<ThemeMode>(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
    // Reasonable default: follow OS preference when possible.
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    return prefersDark ? "dark" : "light";
  }, []);

  const [theme, setThemeState] = useState<ThemeMode>(initial);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  return { theme, setTheme, toggle };
}
