"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface Metric {
  name: string;
  tag?: string;        // e.g. "%" | "číslo" | "text"
  tagColor?: string;
  description: string;
  formula: string;     // plain text / pseudocode
  example: string;     // concrete dosazení
}

const green = "hsl(152,72%,45%)";
const greenBg = "hsl(152 72% 45% / 0.08)";
const greenBorder = "hsl(152 72% 45% / 0.25)";

export function MetricCard({ m }: { m: Metric }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      borderRadius: 10, overflow: "hidden",
      border: `1px solid ${open ? greenBorder : "hsl(var(--border))"}`,
      background: open ? greenBg : "hsl(var(--card)/0.5)",
      transition: "all .15s",
    }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px", background: "none", border: "none", cursor: "pointer",
          fontFamily: "var(--font-body)", textAlign: "left",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: open ? green : "hsl(var(--foreground))", flex: 1 }}>
          {m.name}
        </span>
        {m.tag && (
          <span style={{
            fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
            background: m.tagColor ? `${m.tagColor}22` : "hsl(var(--muted)/0.6)",
            color: m.tagColor ?? "hsl(var(--muted-foreground))",
            border: `1px solid ${m.tagColor ? `${m.tagColor}40` : "hsl(var(--border))"}`,
            fontFamily: "var(--font-mono)", flexShrink: 0,
          }}>{m.tag}</span>
        )}
        <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", flex: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>
          {!open && m.description}
        </span>
        <ChevronDown size={14} style={{ color: "hsl(var(--muted-foreground))", transform: open ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }} />
      </button>

      {open && (
        <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ margin: 0, fontSize: 13, color: "hsl(var(--foreground))", lineHeight: 1.55 }}>
            {m.description}
          </p>

          <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid hsl(var(--border))" }}>
            <div style={{
              padding: "5px 12px", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "hsl(var(--muted-foreground))",
              background: "hsl(var(--muted)/0.4)", borderBottom: "1px solid hsl(var(--border))",
            }}>
              Výpočet
            </div>
            <pre style={{
              margin: 0, padding: "10px 14px", fontSize: 12, lineHeight: 1.6,
              fontFamily: "var(--font-mono)", color: "hsl(var(--foreground))",
              background: "hsl(var(--muted)/0.2)", whiteSpace: "pre-wrap", wordBreak: "break-word",
            }}>
              {m.formula}
            </pre>
          </div>

          <div style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${greenBorder}` }}>
            <div style={{
              padding: "5px 12px", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", color: green,
              background: greenBg, borderBottom: `1px solid ${greenBorder}`,
            }}>
              Příklad — dosazení
            </div>
            <pre style={{
              margin: 0, padding: "10px 14px", fontSize: 12, lineHeight: 1.6,
              fontFamily: "var(--font-mono)", color: "hsl(var(--foreground))",
              background: "hsl(var(--card)/0.5)", whiteSpace: "pre-wrap", wordBreak: "break-word",
            }}>
              {m.example}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export function LibraryPage({
  title, subtitle, icon, metrics,
}: {
  title: string;
  subtitle: string;
  icon: string;
  metrics: Metric[];
}) {
  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 28 }}>{icon}</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>
            {title}
          </h1>
        </div>
        <p style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", margin: 0, lineHeight: 1.5 }}>
          {subtitle}
        </p>
        <div style={{ marginTop: 8, fontSize: 11, color: "hsl(var(--muted-foreground))" }}>
          Klikni na metriku pro zobrazení vzorce a příkladu výpočtu s konkrétními hodnotami.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {metrics.map((m) => (
          <MetricCard key={m.name} m={m} />
        ))}
      </div>
    </div>
  );
}
