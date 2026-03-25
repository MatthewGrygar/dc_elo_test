"use client";

import { useEffect, useState } from "react";
import { useRatingMode } from "./RatingModeProvider";
import { RecordsData, RecordEntry, RecordCategory } from "@/lib/dataFetchers";
import type { PrefetchCache } from "@/app/page";
import { Crown, TrendingUp, Flame, Zap, Swords, Trophy, BarChart2, AlertCircle } from "lucide-react";

const CAT_ICONS: Record<string, React.ElementType> = {
  "👑": Crown, "📈": TrendingUp, "🔥": Flame, "⚡": Zap,
  "⚔️": Swords, "🏆": Trophy, "📊": BarChart2,
};
const CAT_COLORS: Record<string, string> = {
  "👑": "hsl(42,80%,52%)", "📈": "hsl(142,65%,45%)", "🔥": "hsl(22,90%,52%)",
  "⚡": "hsl(260,70%,60%)", "⚔️": "hsl(0,65%,55%)", "🏆": "hsl(42,80%,52%)",
  "📊": "hsl(210,70%,55%)",
};

function GC({ children, style, glow }: { children: React.ReactNode; style?: React.CSSProperties; glow?: string }) {
  return (
    <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", ...style }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0, background: "hsl(var(--card) / 0.88)", backdropFilter: "blur(16px) saturate(150%)", WebkitBackdropFilter: "blur(16px) saturate(150%)", border: "1px solid hsl(var(--card-border) / 0.85)", borderRadius: 16, boxShadow: glow ? `0 0 28px -8px ${glow}` : undefined }} />
      <div style={{ position: "relative", zIndex: 1, paddingBottom: 1 }}>{children}</div>
    </div>
  );
}

function CategoryCard({ category }: { category: RecordCategory }) {
  const Icon = CAT_ICONS[category.icon] ?? Trophy;
  const color = CAT_COLORS[category.icon] ?? "hsl(var(--primary))";
  const validRecords = category.records.filter(r => r.entry && r.entry.value !== "—");
  if (validRecords.length === 0) return null;
  return (
    <GC glow={`${color}28`}>
      <div style={{ padding: "14px 18px 10px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid hsl(var(--border) / 0.3)" }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${color}20`, boxShadow: `0 0 14px -4px ${color}50` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-display)", color: "hsl(var(--foreground))", lineHeight: 1 }}>{category.title}</div>
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", marginTop: 2 }}>{validRecords.length} záznamů</div>
        </div>
      </div>
      <div style={{ padding: "4px 0 6px" }}>
        {validRecords.map((r, i) => {
          const isLast = i === validRecords.length - 1;
          return (
            <div key={r.label} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
              padding: "9px 18px",
              borderBottom: isLast ? "none" : "1px solid hsl(var(--border) / 0.18)",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontFamily: "var(--font-display)", fontWeight: 600, color: "hsl(var(--foreground))", lineHeight: 1.35, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.label}</div>
                {r.entry?.player && <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.entry.player}</div>}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {r.entry?.isAllTime && <div style={{ fontSize: 7, fontFamily: "var(--font-mono)", color: "hsl(42,80%,52%)", letterSpacing: "0.08em", marginBottom: 1 }}>👑 ALL-TIME</div>}
                <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "var(--font-mono)", color: "hsl(var(--foreground))", letterSpacing: "-0.02em", lineHeight: 1 }}>{r.entry?.value}</div>
              </div>
            </div>
          );
        })}
      </div>
    </GC>
  );
}

function HeroCard({ icon: Icon, label, value, player, detail, color }: {
  icon: React.ElementType; label: string; value: string;
  player?: string; detail?: string; color: string;
}) {
  return (
    <GC glow={`${color}45`}>
      <div style={{ padding: "18px 20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${color}22`, boxShadow: `0 0 18px -4px ${color}60` }}>
            <Icon size={19} style={{ color }} />
          </div>
          <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color, background: `${color}18`, border: `1px solid ${color}35`, borderRadius: 99, padding: "2px 8px" }}>
            ALL-TIME 👑
          </div>
        </div>
        <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 34, fontWeight: 800, fontFamily: "var(--font-mono)", color: "hsl(var(--foreground))", lineHeight: 1, letterSpacing: "-0.03em", marginBottom: 6 }}>{value}</div>
        {player && <div style={{ fontSize: 14, fontFamily: "var(--font-display)", fontWeight: 700, color, marginBottom: detail ? 4 : 0, lineHeight: 1.5, overflowY: "visible" }}>{player}</div>}
        {detail && <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", lineHeight: 1.4 }}>{detail}</div>}
      </div>
    </GC>
  );
}

function Sk({ h = 120 }: { h?: number }) {
  return <div style={{ height: h, borderRadius: 16, background: "hsl(var(--muted) / 0.5)", animation: "rec-pulse 1.5s ease-in-out infinite" }} />;
}

export default function RecordsView({ prefetchCache }: { prefetchCache?: PrefetchCache }) {
  const { mode } = useRatingMode();
  const [data, setData] = useState<RecordsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const cached = prefetchCache?.[mode];
    if (cached?.records) { setData(cached.records); setLoading(false); setError(false); return; }
    setLoading(true); setError(false); setData(null);
    fetch(`/api/records?mode=${mode}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [mode, prefetchCache]);

  const amber  = "hsl(42,80%,52%)";
  const green  = "hsl(142,65%,45%)";
  const orange = "hsl(22,90%,52%)";
  const red    = "hsl(0,65%,55%)";

  const allTimePeak  = data?.categories.find(c => c.id === "elo-absolute")?.records[0]?.entry;
  const biggestGain  = data?.categories.find(c => c.id === "gains-losses")?.records[0]?.entry;
  const longestWin   = data?.categories.find(c => c.id === "streaks")?.records[0]?.entry;
  const biggestUpset = data?.categories.find(c => c.id === "opponents")?.records[0]?.entry;

  return (
    <div style={{ height: "100%", overflowY: "auto", overflowX: "hidden", paddingRight: 4 }} className="scrollbar-thin">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid hsl(var(--border) / 0.4)" }}>
        <div style={{ width: 42, height: 42, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", background: `${amber}20`, boxShadow: `0 0 20px -4px ${amber}55` }}>
          <Crown size={22} style={{ color: amber }} />
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, lineHeight: 1 }}>Síň slávy — Rekordy</div>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", marginTop: 3 }}>Historická maxima komunity · {mode} systém</div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "hsl(var(--primary))", background: "hsl(var(--primary) / 0.12)", border: "1px solid hsl(var(--primary) / 0.25)", padding: "4px 12px", borderRadius: 99 }}>{mode}</div>
      </div>

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingBottom: 28 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[1,2,3,4].map(i => <Sk key={i} h={130} />)}
          </div>
          <div style={{ columns: 2, columnGap: 12 }}>
            {[140,200,160,180,150,170].map((h,i) => (
              <div key={i} style={{ breakInside: "avoid" as const, marginBottom: 12 }}><Sk h={h} /></div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, padding: 60 }}>
          <AlertCircle size={32} style={{ color: "hsl(var(--muted-foreground))" }} />
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "hsl(var(--muted-foreground))" }}>Nepodařilo se načíst rekordy — zkontroluj propojení se Sheets</div>
        </div>
      )}

      {!loading && !error && data && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 28 }}>
          {/* Hero row */}
          {(allTimePeak || biggestGain || longestWin || biggestUpset) && (
            <div className="mobile-stack" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {allTimePeak?.player  && <HeroCard icon={Crown}     label="All-time Peak ELO"        value={allTimePeak.value}  player={allTimePeak.player}  detail={allTimePeak.detail}              color={amber} />}
              {biggestGain?.player  && <HeroCard icon={TrendingUp} label="Největší jednorázový zisk" value={biggestGain.value}  player={biggestGain.player}  detail={biggestGain.detail ?? ""}        color={green} />}
              {longestWin?.player   && <HeroCard icon={Flame}      label="Nejdelší win streak"       value={longestWin.value}   player={longestWin.player}   detail={longestWin.detail}              color={orange}/>}
              {biggestUpset?.player && <HeroCard icon={Swords}     label="Největší upset"            value={biggestUpset.value} player={biggestUpset.player} detail={biggestUpset.detail2 ?? biggestUpset.detail} color={red} />}
            </div>
          )}

          {/* Masonry 2-column */}
          <div className="records-masonry" style={{ columns: "2", columnGap: 12 }}>
            {data.categories.map(cat => {
              const validRecords = cat.records.filter(r => r.entry && r.entry.value !== "—");
              if (validRecords.length === 0) return null;
              return (
                <div key={cat.id} style={{ breakInside: "avoid" as const, marginBottom: 12 }}>
                  <CategoryCard category={cat} />
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: "center", fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground) / 0.45)", paddingBottom: 8 }}>
            Rekordy počítány z live dat · Přepni ELO ↔ DCPR pro jiné rekordy
          </div>
        </div>
      )}
      <style jsx global>{`@keyframes rec-pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }`}</style>
    </div>
  );
}
