export type ThemeMode = 'light' | 'dark';
export type DataSource = 'ELO' | 'DCPR';

export type KPIStat = {
  label: string;
  value: number;
  format?: 'int' | 'float' | 'percent';
  hint?: string;
};
