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
import ThankYouModal from "@/components/ThankYouModal";
import { useRatingMode } from "@/components/RatingModeProvider";
import { useRegion } from "@/components/RegionProvider";
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
  cs: ["Načítání dat…", "Zpracovávám statistiky…", "Finalizace…"],
  en: ["Loading data…",  "Processing statistics…",  "Finalizing…"],
  fr: ["Chargement…",    "Calcul des stats…",        "Finalisation…"],
};

const DCPR_LOAD = {
  cs: "Načítám DCPR data…",
  en: "Loading DCPR data…",
  fr: "Chargement DCPR…",
};

// ── Shared keyframes (injected once) ─────────────────────────────────────────
const SPINNER_STYLES = `
  @keyframes sp-spin  { to { transform: rotate(360deg); } }
  @keyframes sp-spin2 { to { transform: rotate(-360deg); } }
  @keyframes sp-pulse { 0%,100% { opacity:.75; transform:scale(1); } 50% { opacity:1; transform:scale(1.09); } }
  @keyframes sp-fade  { from { opacity:0; } to { opacity:1; } }
  @keyframes ls-glow  { 0%,100% { opacity:.6; } 50% { opacity:1; } }
`;

// ── Shared spinner rings ──────────────────────────────────────────────────────
function SpinnerRings({ c1, c2, size = 96 }: { c1: string; c2: string; size?: number }) {
  const inner = Math.round(size * 0.19);
  const icon  = Math.round(size * 0.23);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        border: "2px solid transparent",
        borderTopColor: c1, borderRightColor: `${c1}55`,
        animation: "sp-spin 0.9s linear infinite",
      }} />
      <div style={{
        position: "absolute", inset: inner, borderRadius: "50%",
        border: "1.5px solid transparent",
        borderTopColor: c2, borderLeftColor: `${c2}45`,
        animation: "sp-spin2 1.4s linear infinite",
      }} />
      <div style={{
        position: "absolute", inset: icon, borderRadius: "50%",
        background: `linear-gradient(135deg, ${c1}20, ${c2}14)`,
        border: `1px solid ${c1}38`,
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "sp-pulse 2s ease-in-out infinite",
      }}>
        <Zap size={Math.round(size * 0.23)} style={{ color: c1 }} />
      </div>
    </div>
  );
}

// ── Loading screen ────────────────────────────────────────────────────────────
function LoadingScreen({ progress, exiting }: { progress: number; exiting: boolean }) {
  const [lang, setLang] = useState<"cs" | "en" | "fr">("cs");
  useEffect(() => {
    try {
      const s = localStorage.getItem("dc-elo-lang") as "cs"|"en"|"fr"|null;
      if (s) setLang(s);
    } catch {}
  }, []);

  const phase  = progress < 40 ? 0 : progress < 75 ? 1 : 2;
  const labels = LOAD_LABELS[lang];
  const green  = "hsl(152,72%,48%)";
  const green2 = "hsl(152,55%,32%)";

  return (
    <>
      <style>{SPINNER_STYLES}</style>
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
          position: "absolute", width: 480, height: 480, borderRadius: "50%",
          background: `radial-gradient(circle, ${green}14 0%, transparent 65%)`,
          top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          pointerEvents: "none", animation: "ls-glow 2.5s ease-in-out infinite",
        }} />

        <div className="relative z-10 flex flex-col items-center" style={{ gap: 24 }}>
          <SpinnerRings c1={green} c2={green2} size={96} />

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            {/* progress bar */}
            <div style={{ width: 180, height: 2, borderRadius: 99, background: "hsl(var(--muted))", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 99,
                background: green,
                boxShadow: `0 0 10px ${green}80`,
                transition: "width 0.35s cubic-bezier(0.4,0,0.2,1)",
                width: `${progress}%`,
              }} />
            </div>
            <div style={{
              textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 9,
              color: "hsl(var(--muted-foreground))", letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}>
              {labels[phase]}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── DCPR mode loader overlay ──────────────────────────────────────────────────
function DcprModeLoader({ lang }: { lang: "cs" | "en" | "fr" }) {
  const green  = "hsl(152,72%,48%)";
  const green2 = "hsl(152,55%,32%)";

  return (
    <>
      <style>{SPINNER_STYLES}</style>
      <div style={{
        position: "fixed", inset: 0, zIndex: 1500,
        background: "rgba(0,0,0,0.78)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "sp-fade 0.22s ease forwards",
      }}>
        {/* ambient glow blob */}
        <div style={{
          position: "absolute", width: 420, height: 420, borderRadius: "50%",
          background: `radial-gradient(circle, ${green}16 0%, transparent 68%)`,
          pointerEvents: "none",
        }} />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, position: "relative" }}>
          <SpinnerRings c1={green} c2={green2} size={96} />

          {/* DCPR title */}
          <div style={{
            fontSize: 36, fontWeight: 900,
            fontFamily: "var(--font-display)",
            letterSpacing: "-0.04em", lineHeight: 1,
            background: `linear-gradient(135deg, ${green}, hsl(152,72%,65%))`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            DCPR
          </div>

          {/* subtitle */}
          <div style={{
            fontSize: 12, fontFamily: "var(--font-mono)",
            color: "hsl(var(--muted-foreground))",
            letterSpacing: "0.10em", textTransform: "uppercase",
          }}>
            {DCPR_LOAD[lang]}
          </div>
        </div>
      </div>
    </>
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
    let storedMode   = "ELO";
    try {
      storedRegion = localStorage.getItem("dc-elo-region") ?? "ALL";
      storedMode   = localStorage.getItem("dc-elo-mode")   ?? "ELO";
    } catch {}
    const r = `&region=${storedRegion}`;

    let p = 0;
    const tick = setInterval(() => { p = Math.min(p + 2, 92); setProgress(p); }, 50);

    async function prefetch() {
      try {
        const eloFetch = fetch(`/api/prefetch?mode=ELO${r}`).then(res => res.json());
        const annFetch = fetch("/api/announcements").then(res => res.json()).catch(() => ({ dates: [] }));

        if (storedMode === "DCPR") {
          const [eloData, dcprData, annData] = await Promise.all([
            eloFetch,
            fetch(`/api/prefetch?mode=DCPR${r}`).then(res => res.json()),
            annFetch,
          ]);
          setCache({ ELO: eloData, DCPR: dcprData, announcements: annData.dates ?? [], region: storedRegion });
        } else {
          const [eloData, annData] = await Promise.all([eloFetch, annFetch]);
          setCache({ ELO: eloData, announcements: annData.dates ?? [], region: storedRegion });
        }
      } catch { /* continue anyway */ }

      clearInterval(tick);
      setProgress(100);
      await new Promise(res => setTimeout(res, 420));
      setShowApp(true);
      await new Promise(res => setTimeout(res, 60));
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
          <AppShell prefetchCache={cache} setCache={setCache} />
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

function AppShell({
  prefetchCache,
  setCache,
}: {
  prefetchCache: PrefetchCache;
  setCache: React.Dispatch<React.SetStateAction<PrefetchCache>>;
}) {
  const { view, supportOpen, setSupportOpen, feedbackOpen, setFeedbackOpen, lang } = useAppNav();
  const { mode }   = useRatingMode();
  const { region } = useRegion();

  const [showSetup,   setShowSetup]   = useState(false);
  const [showThanks,  setShowThanks]  = useState(false);
  const [dcprLoading, setDcprLoading] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("dc-elo-setup")) setShowSetup(true);
    } catch {}
  }, []);

  // Lazy-load DCPR when user first switches to DCPR mode
  useEffect(() => {
    if (mode !== "DCPR" || prefetchCache.DCPR) return;
    let cancelled = false;
    setDcprLoading(true);
    fetch(`/api/prefetch?mode=DCPR&region=${region}`)
      .then(res => res.json())
      .then(dcprData => {
        if (cancelled) return;
        setCache(prev => ({ ...prev, DCPR: dcprData }));
        setDcprLoading(false);
      })
      .catch(() => { if (!cancelled) setDcprLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, region]);

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
      {showSetup  && <SetupModal    onDone={() => { setShowSetup(false);  setShowThanks(true); }} />}
      {showThanks && <ThankYouModal onDone={() => { setShowThanks(false); window.location.reload(); }} />}
      {dcprLoading && <DcprModeLoader lang={lang as "cs"|"en"|"fr"} />}

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
