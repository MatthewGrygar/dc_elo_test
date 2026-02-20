export type Theme = "dark" | "light";

const STORAGE_KEY = "dc-elo-theme";

/**
 * Reads theme preference:
 * 1) localStorage (explicit user choice)
 * 2) OS preference
 * 3) default = dark (for a gaming-ish product)
 */
export function getInitialTheme(): Theme {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "dark" || saved === "light") return saved;

  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  return prefersDark ? "dark" : "light";
}

export function applyTheme(theme: Theme): void {
  // "dark" class turns on the dark design tokens and Tailwind dark: variants.
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  localStorage.setItem(STORAGE_KEY, theme);
}

export function toggleTheme(current: Theme): Theme {
  return current === "dark" ? "light" : "dark";
}
