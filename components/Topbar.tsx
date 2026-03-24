"use client";

import { Search, X, Menu } from "lucide-react";
import { useRatingMode } from "./RatingModeProvider";
import { useState, useEffect, useRef } from "react";
import { useAppNav } from "./AppContext";
import { Player } from "@/lib/sheets";
import { avatarInitials } from "@/lib/utils";
import { t, TKey } from "@/lib/i18n";

function fuzzyScore(q: string, name: string): number {
  const ql = q.toLowerCase(), nl = name.toLowerCase();
  let qi = 0, score = 0;
  for (let i = 0; i < nl.length && qi < ql.length; i++) {
    if (nl[i] === ql[qi]) { score += (i === 0 || nl[i-1] === " ") ? 3 : 1; qi++; }
  }
  return qi === ql.length ? score : 0;
}

export default function Topbar() {
  const { mode } = useRatingMode();
  const { view, selectedPlayer, playerSubView, lang, openPlayer, setSidebarOpen } = useAppNav();
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/players?mode=${mode}`).then(r => r.json()).then(setPlayers).catch(() => {});
  }, [mode]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node) && inputRef.current && !inputRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const results = query.trim().length < 1 ? [] : players
    .map(p => ({ p, s: fuzzyScore(query, p.name) }))
    .filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 6).map(x => x.p);

  const titleKey = view === "player" ? "player" : view as TKey;
  const subKey   = `sub_${view}` as TKey;
  const title    = view === "player" && selectedPlayer ? selectedPlayer.name : t(lang, titleKey);
  const subtitle = view === "player" && selectedPlayer
    ? `${t(lang, "rating")}: ${selectedPlayer.rating} • ${t(lang, playerSubView as TKey)}`
    : t(lang, subKey);

  return (
    <div style={{ height: "var(--topbar-h)", display: "flex", alignItems: "center", padding: "0 16px", gap: 12, borderBottom: "1px solid hsl(var(--border) / 0.6)", flexShrink: 0, position: "relative", zIndex: 20 }}>
      <div style={{ position: "absolute", inset: 0, background: "hsl(var(--background-2) / 0.82)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", pointerEvents: "none" }} />

      {/* mobile hamburger */}
      <button onClick={() => setSidebarOpen(true)} className="flex md:hidden"
        style={{ position: "relative", zIndex: 1, width: 32, height: 32, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--muted) / 0.5)", alignItems: "center", justifyContent: "center", color: "hsl(var(--muted-foreground))", cursor: "pointer", flexShrink: 0 }}>
        <Menu size={15} />
      </button>

      {/* title */}
      <div style={{ position: "relative", zIndex: 1, flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>{title}</h1>
          <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flexShrink: 1 }} className="hidden sm:block">{subtitle}</span>
        </div>
      </div>

      {/* mode badge */}
      <div style={{ position: "relative", zIndex: 1, flexShrink: 0, padding: "3px 10px", borderRadius: 6, background: "hsl(var(--primary) / 0.12)", border: "1px solid hsl(var(--primary) / 0.28)", color: "hsl(var(--primary))", fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.07em" }} className="hidden sm:block">{mode}</div>

      {/* search */}
      <div style={{ position: "relative", zIndex: 10, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 10px", height: 32, background: "hsl(var(--muted) / 0.6)", border: `1px solid ${open || query ? "hsl(var(--primary) / 0.42)" : "hsl(var(--border))"}`, borderRadius: 8, transition: "all 0.2s" }}>
          <Search size={13} color="hsl(var(--muted-foreground))" style={{ flexShrink: 0 }} />
          <input ref={inputRef} value={query} onChange={e => { setQuery(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
            placeholder={t(lang, "search_placeholder")}
            style={{ background: "transparent", border: "none", outline: "none", fontSize: 12, fontFamily: "var(--font-body)", color: "hsl(var(--foreground))", width: 140 }} />
          {query && <button onClick={() => { setQuery(""); setOpen(false); }} style={{ background: "none", border: "none", cursor: "pointer", color: "hsl(var(--muted-foreground))", padding: 0, display: "flex" }}><X size={12} /></button>}
        </div>

        {open && results.length > 0 && (
          <div ref={dropRef} style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, width: 240, borderRadius: 12, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", boxShadow: "0 12px 32px hsl(222 28% 5% / 0.28)", overflow: "hidden", zIndex: 100 }}>
            {results.map((p, i) => (
              <button key={p.id} onClick={() => { openPlayer(p); setQuery(""); setOpen(false); }}
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 12px", background: "transparent", border: "none", borderBottom: i < results.length - 1 ? "1px solid hsl(var(--border) / 0.5)" : "none", cursor: "pointer", textAlign: "left", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--muted) / 0.7)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: "hsl(var(--primary) / 0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "hsl(var(--primary))", fontFamily: "var(--font-display)" }}>{avatarInitials(p.name)}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--foreground))", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{p.rating} pts · #{p.id}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
