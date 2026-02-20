import styles from "./dashboard.module.css";

type Panel = {
  label: string;
  value: string;
  hint: string;
  accent?: "primary" | "positive" | "negative" | "highlight";
};

const ACCENT = {
  primary: "var(--data-primary)",
  positive: "var(--data-positive)",
  negative: "var(--data-negative)",
  highlight: "var(--data-highlight)",
} as const;

/**
 * SummaryPanels are small KPI-like cards.
 * In the future these will use real aggregated stats from the Google Sheet / API.
 */
export function SummaryPanels() {
  const panels: Panel[] = [
    { label: "Top ELO", value: "—", hint: "Nejvyšší rating", accent: "highlight" },
    { label: "Active Players", value: "—", hint: "Z Elo standings", accent: "primary" },
    { label: "Matches", value: "—", hint: "Součet Games / 2", accent: "secondary" as any },
    { label: "Winrate Avg", value: "—", hint: "Průměr G", accent: "positive" },
  ];

  return (
    <div className="grid grid-4" style={{ marginTop: 10 }}>
      {panels.map((p) => (
        <div key={p.label} className={`${styles.kpi} panel panel--interactive`}>
          <div className={styles.kpiTop}>
            <div className={styles.kpiLabel}>{p.label}</div>
            <div
              className={styles.kpiChip}
              style={{ background: ACCENT[(p.accent ?? "primary") as keyof typeof ACCENT] }}
              aria-hidden
            />
          </div>
          <div className={styles.kpiValue}>{p.value}</div>
          <div className="muted" style={{ fontSize: 12 }}>
            {p.hint}
          </div>
        </div>
      ))}
    </div>
  );
}
