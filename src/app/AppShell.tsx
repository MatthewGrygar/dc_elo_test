import { useEffect } from "react";
import { Header } from "../components/Header/Header";
import { BannerSlider } from "../components/Banner/BannerSlider";
import { DashboardSection } from "../components/Dashboard/DashboardSection";
import { LeaderboardSection } from "../components/Leaderboard/LeaderboardSection";
import { useTheme } from "../hooks/useTheme";

/**
 * AppShell is the "frame" of the app.
 * Keep it stable and predictable: header → hero → dashboard → leaderboard → modals.
 * Future sections (Metagame, Commander stats, Match history) should be appended as siblings.
 */
export function AppShell() {
  const { theme, setTheme } = useTheme();

  // Initialize default theme once. (We keep it explicit for readability.)
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="page">
      <Header theme={theme} onThemeChange={setTheme} />
      <main>
        <BannerSlider />
        <DashboardSection />
        <LeaderboardSection />
      </main>
      <footer className="container" style={{ padding: "24px 0 40px" }}>
        <div className="muted" style={{ fontSize: 13 }}>
          DC ELO 2.0 — v2.3 • Placeholder build • Data source: Google Sheets
        </div>
      </footer>
    </div>
  );
}
