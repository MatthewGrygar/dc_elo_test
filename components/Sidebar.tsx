"use client";

import { useTheme } from "next-themes";
import { useRatingMode } from "./RatingModeProvider";
import { useAppNav, BaseView, PlayerSubView } from "./AppContext";
import { avatarInitials } from "@/lib/utils";
import { useState, useEffect } from "react";
import { t, Lang } from "@/lib/i18n";
import {
  LayoutDashboard, Trophy, TrendingUp, Activity, Medal,
  GitCompare, Newspaper, Building2, Moon, Sun,
  ChevronLeft, ChevronRight, X, Eye, Swords, Star, Clock, Zap, Menu,
} from "lucide-react";

const MAIN_NAV: { id: BaseView; icon: React.ElementType; tKey: string }[] = [
  { id: "dashboard",   icon: LayoutDashboard, tKey: "dashboard"  },
  { id: "leaderboard", icon: Trophy,          tKey: "leaderboard"},
  { id: "statistics",  icon: Activity,        tKey: "statistics" },
  { id: "analytics",   icon: TrendingUp,      tKey: "analytics"  },
  { id: "records",     icon: Medal,           tKey: "records"    },
  { id: "compare",     icon: GitCompare,      tKey: "compare"    },
];

const CONTENT_NAV: { id: BaseView; icon: React.ElementType; tKey: string }[] = [
  { id: "articles",     icon: Newspaper, tKey: "articles"     },
  { id: "organization", icon: Building2, tKey: "organization" },
];

const PLAYER_SUB: { id: PlayerSubView; icon: React.ElementType; tKey: string }[] = [
  { id: "overview",    icon: Eye,    tKey: "overview"          },
  { id: "opponents",   icon: Swords, tKey: "opponents"         },
  { id: "tournaments", icon: Star,   tKey: "tournament_history"},
  { id: "history",     icon: Clock,  tKey: "match_history"     },
];

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: "cs", flag: "🇨🇿", label: "CZ" },
  { code: "en", flag: "🇬🇧", label: "EN" },
  { code: "fr", flag: "🇫🇷", label: "FR" },
];

export default function Sidebar() {
  const { resolvedTheme, setTheme } = useTheme();
  const { mode, setMode } = useRatingMode();
  const { view, playerSubView, selectedPlayer, lang, sidebarOpen,
          navigateTo, closePlayer, setPlayerSubView, setLang, setSidebarOpen } = useAppNav();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isDark = resolvedTheme === "dark";

  useEffect(() => setMounted(true), []);

  const isPlayer = view === "player";

  function NavBtn({ icon: Icon, label, active, onClick, badge }: {
    icon: React.ElementType; label: string; active: boolean; onClick: () => void; badge?: string;
  }) {
    return (
      <button onClick={onClick} title={collapsed ? label : undefined}
        style={{
          display: "flex", alignItems: "center",
          gap: collapsed ? 0 : 10,
          padding: collapsed ? "9px 0" : "8px 12px",
          justifyContent: collapsed ? "center" : "flex-start",
          width: "100%", borderRadius: 10, border: "1px solid transparent",
          ...(active ? {
            background: "hsl(var(--primary) / 0.12)",
            border: "1px solid hsl(var(--primary) / 0.28)",
            color: "hsl(var(--primary))",
          } : {
            background: "transparent",
            color: "hsl(var(--muted-foreground))",
          }),
          fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13,
          cursor: "pointer", transition: "all 0.18s", textAlign: "left",
        }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "hsl(var(--muted) / 0.7)"; e.currentTarget.style.color = "hsl(var(--foreground))"; } }}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "hsl(var(--muted-foreground))"; } }}
      >
        <Icon size={15} style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }} />
        {!collapsed && (
          <>
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
            {badge && (
              <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 99, background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.3)", fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>{badge}</span>
            )}
            {active && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "hsl(var(--primary))", flexShrink: 0 }} />}
          </>
        )}
      </button>
    );
  }

  function Divider({ label }: { label?: string }) {
    if (collapsed) return <div style={{ height: 1, background: "hsl(var(--border) / 0.5)", margin: "5px 6px" }} />;
    return (
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "hsl(var(--muted-foreground) / 0.55)", fontFamily: "var(--font-mono)", padding: "0 12px", marginBottom: 2, marginTop: 4 }}>{label}</div>
    );
  }

  const sidebarContent = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "0 8px 12px", gap: 2, overflowY: "auto", overflowX: "hidden" }}>
      {/* Logo row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 4px 12px", justifyContent: collapsed ? "center" : "space-between", flexShrink: 0 }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "hsl(var(--primary))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 14px hsl(var(--primary) / 0.38)" }}>
              <Zap size={17} color="hsl(var(--primary-foreground))" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 17, letterSpacing: "-0.03em", lineHeight: 1 }}>
                DC <span style={{ color: "hsl(var(--primary))" }}>ELO</span>
              </div>
              <div style={{ fontSize: 9, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 2 }}>
                Rating System
              </div>
            </div>
          </div>
        )}
        {collapsed && (
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "hsl(var(--primary))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px hsl(var(--primary) / 0.38)" }}>
            <Zap size={17} color="hsl(var(--primary-foreground))" strokeWidth={2.5} />
          </div>
        )}
        <button onClick={() => setCollapsed(c => !c)} className="hidden md:flex"
          style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid hsl(var(--border))", background: "hsl(var(--muted) / 0.5)", alignItems: "center", justifyContent: "center", color: "hsl(var(--muted-foreground))", cursor: "pointer", flexShrink: 0 }}>
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
        <button onClick={() => setSidebarOpen(false)} className="flex md:hidden"
          style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid hsl(var(--border))", background: "hsl(var(--muted) / 0.5)", alignItems: "center", justifyContent: "center", color: "hsl(var(--muted-foreground))", cursor: "pointer" }}>
          <X size={12} />
        </button>
      </div>

      {/* Mode toggle */}
      {!collapsed ? (
        <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", border: "1px solid hsl(var(--border))", marginBottom: 8, flexShrink: 0 }}>
          {(["ELO", "DCPR"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "6px 0", fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.06em", background: mode === m ? "hsl(var(--primary))" : "transparent", color: mode === m ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))", border: "none", cursor: "pointer", transition: "all 0.18s" }}>{m}</button>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
          {(["ELO", "DCPR"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} title={m} style={{ padding: "4px 0", borderRadius: 7, fontSize: 8, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.06em", background: mode === m ? "hsl(var(--primary))" : "hsl(var(--muted) / 0.5)", color: mode === m ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))", border: "none", cursor: "pointer" }}>{m}</button>
          ))}
        </div>
      )}

      {/* Player breadcrumb */}
      {isPlayer && selectedPlayer && (
        <div style={{ background: "hsl(var(--primary) / 0.08)", border: "1px solid hsl(var(--primary) / 0.22)", borderRadius: 10, padding: collapsed ? "8px 0" : "10px", marginBottom: 4, flexShrink: 0 }}>
          {!collapsed ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "hsl(var(--primary) / 0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "hsl(var(--primary))", fontFamily: "var(--font-display)", flexShrink: 0 }}>
                  {avatarInitials(selectedPlayer.name)}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "hsl(var(--primary))", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedPlayer.name}</div>
                  <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{selectedPlayer.rating} pts</div>
                </div>
                <button onClick={closePlayer} style={{ width: 18, height: 18, borderRadius: 4, border: "1px solid hsl(var(--border))", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "hsl(var(--muted-foreground))", cursor: "pointer", flexShrink: 0 }}>
                  <X size={10} />
                </button>
              </div>
              {PLAYER_SUB.map(s => <NavBtn key={s.id} icon={s.icon} label={t(lang, s.tKey as any)} active={playerSubView === s.id} onClick={() => setPlayerSubView(s.id)} />)}
            </>
          ) : (
            <div style={{ width: 28, height: 28, margin: "auto", borderRadius: 8, background: "hsl(var(--primary) / 0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "hsl(var(--primary))", fontFamily: "var(--font-display)" }}>
              {avatarInitials(selectedPlayer.name)}
            </div>
          )}
        </div>
      )}

      {/* Main nav */}
      <Divider label="Hlavní" />
      {MAIN_NAV.map(n => (
        <NavBtn key={n.id} icon={n.icon} label={t(lang, n.tKey as any)} active={view === n.id} onClick={() => navigateTo(n.id)} badge={n.id === "compare" ? "NEW" : undefined} />
      ))}

      {/* Content nav */}
      <Divider label="Obsah" />
      {CONTENT_NAV.map(n => (
        <NavBtn key={n.id} icon={n.icon} label={t(lang, n.tKey as any)} active={view === n.id} onClick={() => navigateTo(n.id)} />
      ))}

      <div style={{ flex: 1 }} />

      {/* Language switcher */}
      {!collapsed ? (
        <div style={{ display: "flex", gap: 4, marginBottom: 4, flexShrink: 0 }}>
          {LANGS.map(l => (
            <button key={l.code} onClick={() => setLang(l.code)} title={l.label} style={{ flex: 1, padding: "4px 0", borderRadius: 8, border: `1px solid ${lang === l.code ? "hsl(var(--primary) / 0.32)" : "hsl(var(--border))"}`, background: lang === l.code ? "hsl(var(--primary) / 0.12)" : "transparent", color: lang === l.code ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))", fontSize: 9, fontWeight: 700, fontFamily: "var(--font-mono)", cursor: "pointer", transition: "all 0.18s", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
              <span style={{ fontSize: 12 }}>{l.flag}</span><span>{l.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 4 }}>
          {LANGS.map(l => (
            <button key={l.code} onClick={() => setLang(l.code)} title={l.label} style={{ padding: "3px 0", borderRadius: 6, fontSize: 12, lineHeight: 1, border: `1px solid ${lang === l.code ? "hsl(var(--primary) / 0.32)" : "hsl(var(--border))"}`, background: lang === l.code ? "hsl(var(--primary) / 0.12)" : "transparent", cursor: "pointer" }}>
              {l.flag}
            </button>
          ))}
        </div>
      )}

      {/* Theme toggle */}
      <button onClick={() => setTheme(isDark ? "light" : "dark")} style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 10, width: "100%", padding: collapsed ? "8px 0" : "8px 12px", borderRadius: 10, border: "1px solid hsl(var(--border))", background: "hsl(var(--muted) / 0.4)", color: "hsl(var(--muted-foreground))", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "var(--font-body)", transition: "all 0.18s", flexShrink: 0 }}
        onMouseEnter={e => { e.currentTarget.style.background = "hsl(var(--muted))"; e.currentTarget.style.color = "hsl(var(--foreground))"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "hsl(var(--muted) / 0.4)"; e.currentTarget.style.color = "hsl(var(--muted-foreground))"; }}>
        {mounted && (isDark ? <Sun size={14} /> : <Moon size={14} />)}
        {!collapsed && mounted && <span>{isDark ? t(lang, "light_mode") : t(lang, "dark_mode")}</span>}
      </button>
    </div>
  );

  return (
    <>
      {sidebarOpen && <div className="sidebar-overlay md:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside
        style={{ width: collapsed ? "var(--sidebar-w-collapsed)" : "var(--sidebar-w)", minWidth: collapsed ? "var(--sidebar-w-collapsed)" : "var(--sidebar-w)", transition: "width .28s cubic-bezier(.4,0,.2,1), min-width .28s cubic-bezier(.4,0,.2,1), transform .3s ease", borderRight: "1px solid hsl(var(--border) / 0.65)", display: "flex", flexDirection: "column", position: "relative", zIndex: 40, flexShrink: 0, overflow: "hidden" }}
        className={["fixed md:relative", "h-full", sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"].join(" ")}
      >
        <div style={{ position: "absolute", inset: 0, background: "hsl(var(--background-2) / 0.96)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }} />
        <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>{sidebarContent}</div>
      </aside>
    </>
  );
}
