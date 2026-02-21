import type { ThemeMode } from '../types/app';

export function getPreferredThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
  return mq?.matches ? 'dark' : 'light';
}
