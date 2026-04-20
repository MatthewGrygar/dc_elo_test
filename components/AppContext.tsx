"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Player } from "@/lib/sheets";
import { Lang } from "@/lib/i18n";

export type BaseView =
  | "dashboard" | "statistics" | "analytics" | "leaderboard"
  | "records"   | "compare"   | "articles"  | "organization" | "tournaments";

export type PlayerSubView = "overview" | "opponents" | "tournaments" | "history";
export type OrgTab = "about" | "spoluprace";
export type ViewType = BaseView | "player";

interface AppState {
  view: ViewType;
  playerSubView: PlayerSubView;
  orgTab: OrgTab;
  selectedPlayer: Player | null;
  lang: Lang;
  sidebarOpen: boolean;
  supportOpen: boolean;
  feedbackOpen: boolean;
}

interface AppContextType extends AppState {
  navigateTo: (view: BaseView) => void;
  openPlayer: (player: Player) => void;
  closePlayer: () => void;
  setPlayerSubView: (sub: PlayerSubView) => void;
  setOrgTab: (tab: OrgTab) => void;
  setLang: (lang: Lang) => void;
  setSidebarOpen: (open: boolean) => void;
  setSupportOpen: (open: boolean) => void;
  setFeedbackOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType>({
  view: "dashboard", playerSubView: "overview", orgTab: "about",
  selectedPlayer: null, lang: "cs", sidebarOpen: false, supportOpen: false, feedbackOpen: false,
  navigateTo: () => {}, openPlayer: () => {}, closePlayer: () => {},
  setPlayerSubView: () => {}, setOrgTab: () => {}, setLang: () => {},
  setSidebarOpen: () => {}, setSupportOpen: () => {}, setFeedbackOpen: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    view: "dashboard", playerSubView: "overview", orgTab: "about",
    selectedPlayer: null, lang: "cs", sidebarOpen: false, supportOpen: false, feedbackOpen: false,
  });

  // Hydrate lang from localStorage (or auto-detect) on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("dc-elo-lang") as Lang | null;
      if (stored && ["cs", "en", "fr"].includes(stored)) {
        setState(s => ({ ...s, lang: stored }));
      } else {
        const bl = navigator.language.toLowerCase();
        const detected: Lang = bl.startsWith("fr") ? "fr" : (bl.startsWith("cs") || bl.startsWith("sk")) ? "cs" : "en";
        setState(s => ({ ...s, lang: detected }));
      }
    } catch {}
  }, []);

  const navigateTo  = (view: BaseView)          => setState(s => ({ ...s, view, playerSubView: "overview", orgTab: "about", sidebarOpen: false }));
  const openPlayer  = (player: Player)          => setState(s => ({ ...s, view: "player", playerSubView: "overview", selectedPlayer: player, sidebarOpen: false }));
  const closePlayer = ()                         => setState(s => ({ ...s, view: "leaderboard", selectedPlayer: null }));
  const setPlayerSubView = (sub: PlayerSubView) => setState(s => ({ ...s, playerSubView: sub, view: "player" }));
  const setOrgTab   = (orgTab: OrgTab)          => setState(s => ({ ...s, orgTab }));
  const setLang     = (lang: Lang) => {
    setState(s => ({ ...s, lang }));
    try { localStorage.setItem("dc-elo-lang", lang); } catch {}
  };
  const setSidebarOpen  = (open: boolean) => setState(s => ({ ...s, sidebarOpen: open }));
  const setSupportOpen  = (open: boolean) => setState(s => ({ ...s, supportOpen: open }));
  const setFeedbackOpen = (open: boolean) => setState(s => ({ ...s, feedbackOpen: open }));

  return (
    <AppContext.Provider value={{ ...state, navigateTo, openPlayer, closePlayer, setPlayerSubView, setOrgTab, setLang, setSidebarOpen, setSupportOpen, setFeedbackOpen }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppNav() { return useContext(AppContext); }
