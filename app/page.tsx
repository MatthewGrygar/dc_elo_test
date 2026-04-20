"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { AppProvider, useAppNav } from "@/components/AppContext";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import DashboardView from "@/components/DashboardView";
import AnalyticsView from "@/components/AnalyticsView";
import StatisticsView from "@/components/StatisticsView";
import LeaderboardTable from "@/components/LeaderboardTable";
import PlayerDetailView from "@/components/PlayerDetailView";
import RecordsView from "@/components/RecordsView";
import CompareView from "@/components/CompareView";
import ArticlesView from "@/components/ArticlesView";
import OrganizationView from "@/components/OrganizationView";
import TournamentsView from "@/components/TournamentsView";
import SupportModal from "@/components/SupportModal";
import FeedbackModal from "@/components/FeedbackModal";
import SetupModal from "@/components/SetupModal";
import { Zap } from "lucide-react";

const ParticlesBackground = dynamic(
  () => import("@/components/ParticlesBackground"),
  { ssr: false }
);

export type PrefetchCache = {
  ELO?:  { dashboard: any; players: any[]; stats: any; analytics: any; records: any };
  DCPR?: { dashboard: any; players: any[]; stats: any; analytics: any; records: any };
  announcements?: string[];
  region?: string;
};

// ── Loading labels ────────────────────────────────────────────────────────────
const LOAD_LABELS = {
  cs: ["Načítání ELO dat…", "Načítání DCPR dat…", "Připravuji statistiky…", "Finalizace…"],
  en: ["Loading ELO data…", "Loading DCPR data…", "Preparing statistics…",  "Finalizing…"],
  fr: ["Chargement ELO…",   "Chargement DCPR…",   "Préparation stats…",     "Finalisation…"],
};

// ── Loading screen ────────────────────────────────────────────────────────────
function LoadingScreen({ progress, exiting }: { progress: number; exiting: boolean }) {
  const [lang, setLang] = useState<"cs" | "en" | "fr">("cs");
  useEffect(() => {
    try {
      const s = localStorage.getItem("dc-elo-lang") as "cs"|"en"|"fr"|null;
      if (s) setLang(s);
    } catch {}
  }, []);

  const phase  = progress < 35 ? 0 : progress < 65 ? 1 : progress < 88 ? 2 : 3;
  const labels = LOAD_LABELS[lang];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: "hsl(var(--background))",
        opacity: exiting ? 0 : 1,
        transition: exiting ? "opacity 0.65s cubic-bezier(0.4,0,0.2,1)" : "none",
        pointerEvents: exiting ? "none" : "all",
      }}
    >
      {/* ambient glow */}
      <div style={{
        position: "absolute", width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, hsl(var(--primary)/0.10) 0%, transparent 65%)",
        top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none",
        animation: "ls-glow 2.5s ease-in-out infinite",
      }} />

      <div className="relative z-10 flex flex-col items-center" style={{ gap: 28 }}>
        {/* logo */}
        <div style={{
          width: 76, height: 76, borderRadius: 22,
          background: "hsl(var(--primary))",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "logo-pulse 1.8s ease-in-out infinite",
        }}>
          <Zap size={34} color="hsl(var(--primary-foreground))" strokeWidth={2.5} />
        </div>

        {/* wordmark */}
        <div style={{ textAlign: "center", lineHeight: 1, userSelect: "none" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 900, letterSpacing: "-0.04em" }}>
            DC <span style={{ color: "hsl(var(--primary))" }}>ELO</span>
          </div>
          <div style={{ fontSize: 9, letterSpacing: "0.18em", color: "hsl(var(--muted-foreground))", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginTop: 5 }}>
            Rating System · DCPR · Duel Commander
          </div>
        </div>

        {/* progress bar */}
        <div style={{ width: 220, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ height: 3, background: "hsl(var(--border)/0.4)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${progress}%`, borderRadius: 99,
              background: "hsl(var(--primary))",
              boxShadow: "0 0 14px hsl(var(--primary)/0.65)",
              transition: "width 0.35s cubic-bezier(0.4,0,0.2,1)",
            }} />
          </div>
          <div style={{
            textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 9,
            color: "hsl(var(--muted-foreground))", letterSpacing: "0.12em",
            textTransform: "uppercase",
            animation: "ls-label 0.3s ease both",
          }}>
            {labels[phase]}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Entry ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [cache, setCache]       = useState<PrefetchCache>({});
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting]   = useState(false);
  const [showApp, setShowApp]   = useState(false);

  useEffect(() => {
    let storedRegion = "ALL";
    try { storedRegion = localStorage.getItem("dc-elo-region") ?? "ALL"; } catch {}
    const r = `&region=${storedRegion}`;

    let p = 0;
    const tick = setInterval(() => { p = Math.min(p + 1.5, 92); setProgress(p); }, 50);

    async function prefetch() {
      try {
        const [eloDash, eloPlayers, eloStats, eloAnalytics, eloRecords, annData] = await Promise.all([
          fetch(`/api/dashboard?mode=ELO${r}`).then(r => r.json()),
          fetch(`/api/players?mode=ELO${r}`).then(r => r.json()),
          fetch(`/api/general-stats?mode=ELO${r}`).then(r => r.json()),
          fetch(`/api/analytics-data?mode=ELO${r}`).then(r => r.json()),
          fetch(`/api/records?mode=ELO${r}`).then(r => r.json()),
          fetch("/api/announcements").then(r => r.json()).catch(() => ({ dates: [] })),
        ]);
        setProgress(52);
        const [dcprDash, dcprPlayers, dcprStats, dcprAnalytics, dcprRecords] = await Promise.all([
          fetch(`/api/dashboard?mode=DCPR${r}`).then(r => r.json()),
          fetch(`/api/players?mode=DCPR${r}`).then(r => r.json()),
          fetch(`/api/general-stats?mode=DCPR${r}`).then(r => r.json()),
          fetch(`/api/analytics-data?mode=DCPR${r}`).then(r => r.json()),
          fetch(`/api/records?mode=DCPR${r}`).then(r => r.json()),
        ]);
        setProgress(90);
        setCache({
          ELO:  { dashboard: eloDash,  players: eloPlayers,  stats: eloStats,  analytics: eloAnalytics,  records: eloRecords  },
          DCPR: { dashboard: dcprDash, players: dcprPlayers, stats: dcprStats, analytics: dcprAnalytics, records: dcprRecords },
          announcements: annData.dates ?? [],
          region: storedRegion,
        });
      } catch { /* continue anyway */ }

      clearInterval(tick);
      setProgress(100);
      await new Promise(r => setTimeout(r, 420));
      setShowApp(true);
      await new Promise(r => setTimeout(r, 60));
      setExiting(true);
    }

    prefetch();
    return () => clearInterval(tick);
  }, []);

  return (
    <>
      {!exiting && <LoadingScreen progress={progress} exiting={exiting} />}
      {showApp && (
        <AppProvider>
          <AppShell prefetchCache={cache} />
        </AppProvider>
      )}
    </>
  );
}

// ── App Shell ─────────────────────────────────────────────────────────────────
const VIEW_ORDER = [
  "dashboard", "leaderboard", "statistics", "analytics",
  "records", "compare", "tournaments", "articles", "organization", "player",
];

function AppShell({ prefetchCache }: { prefetchCache: PrefetchCache }) {
  const { view, supportOpen, setSupportOpen, feedbackOpen, setFeedbackOpen } = useAppNav();
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("dc-elo-setup")) setShowSetup(true);
    } catch {}
  }, []);
  const [animKey, setAnimKey]   = useState(0);
  const [slideDir, setSlideDir] = useState<"R"|"L">("R");
  const prevView = useRef(view);

  useEffect(() => {
    if (view === prevView.current) return;
    const ci = VIEW_ORDER.indexOf(prevView.current);
    const ni = VIEW_ORDER.indexOf(view);
    setSlideDir(ni >= ci ? "R" : "L");
    setAnimKey(k => k + 1);
    prevView.current = view;
  }, [view]);

  return (
    <div className="fixed inset-0 flex overflow-hidden" style={{ background: "hsl(var(--background))" }}>
      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      {showSetup && <SetupModal onDone={() => { setShowSetup(false); window.location.reload(); }} />}
      {/* particles */}
      <ParticlesBackground />

      {/* ambient mesh */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-mesh" />
      <div className="pointer-events-none fixed inset-0 z-0" style={{
        background: "radial-gradient(ellipse 70% 50% at 62% -5%, hsl(var(--primary)/0.08) 0%, transparent 60%)",
      }} />

      {/* sidebar */}
      <Sidebar />

      {/* main column */}
      <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 10, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar />

        <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
          <div
            key={animKey}
            style={{
              position: "absolute", inset: 0,
              padding: 14, display: "flex", flexDirection: "column", overflow: "hidden",
              animation: `${slideDir === "R" ? "shell-in-r" : "shell-in-l"} 0.28s cubic-bezier(.4,0,.2,1) forwards`,
            }}
          >
            <ViewContent prefetchCache={prefetchCache} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── View router ───────────────────────────────────────────────────────────────
function ViewContent({ prefetchCache }: { prefetchCache: PrefetchCache }) {
  const { view } = useAppNav();
  switch (view) {
    case "dashboard":    return <DashboardView    prefetchCache={prefetchCache} />;
    case "statistics":   return <StatisticsView   prefetchCache={prefetchCache} />;
    case "analytics":    return <AnalyticsView    prefetchCache={prefetchCache} />;
    case "records":      return <RecordsView      prefetchCache={prefetchCache} />;
    case "leaderboard":  return <LeaderboardTable prefetchCache={prefetchCache} />;
    case "player":       return <PlayerDetailView announcementDates={prefetchCache.announcements ?? []} />;
    case "compare":      return <CompareView      prefetchCache={prefetchCache} />;
    case "tournaments":  return <TournamentsView />;
    case "articles":     return <ArticlesView />;
    case "organization": return <OrganizationView />;
    default:             return null;
  }
}
