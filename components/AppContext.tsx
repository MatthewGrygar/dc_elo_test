"use client";

import React, { createContext, useContext, useState } from "react";
import { Player } from "@/lib/sheets";
import { Lang } from "@/lib/i18n";

export type BaseView =
  | "dashboard" | "statistics" | "analytics" | "leaderboard"
  | "records"   | "compare"   | "articles"  | "organization";

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
}

interface AppContextType extends AppState {
  navigateTo: (view: BaseView) => void;
  openPlayer: (player: Player) => void;
  closePlayer: () => void;
  setPlayerSubView: (sub: PlayerSubView) => void;
  setOrgTab: (tab: OrgTab) => void;
  setLang: (lang: Lang) => void;
  setSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType>({
  view: "dashboard", playerSubView: "overview", orgTab: "about",
  selectedPlayer: null, lang: "cs", sidebarOpen: false,
  navigateTo: () => {}, openPlayer: () => {}, closePlayer: () => {},
  setPlayerSubView: () => {}, setOrgTab: () => {}, setLang: () => {}, setSidebarOpen: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    view: "dashboard", playerSubView: "overview", orgTab: "about",
    selectedPlayer: null, lang: "cs", sidebarOpen: false,
  });

  const navigateTo  = (view: BaseView)        => setState(s => ({ ...s, view, playerSubView: "overview", orgTab: "about", sidebarOpen: false }));
  const openPlayer  = (player: Player)        => setState(s => ({ ...s, view: "player", playerSubView: "overview", selectedPlayer: player, sidebarOpen: false }));
  const closePlayer = ()                       => setState(s => ({ ...s, view: "leaderboard", selectedPlayer: null }));
  const setPlayerSubView = (sub: PlayerSubView) => setState(s => ({ ...s, playerSubView: sub, view: "player" }));
  const setOrgTab   = (orgTab: OrgTab)        => setState(s => ({ ...s, orgTab }));
  const setLang     = (lang: Lang)            => setState(s => ({ ...s, lang }));
  const setSidebarOpen = (open: boolean)      => setState(s => ({ ...s, sidebarOpen: open }));

  return (
    <AppContext.Provider value={{ ...state, navigateTo, openPlayer, closePlayer, setPlayerSubView, setOrgTab, setLang, setSidebarOpen }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppNav() { return useContext(AppContext); }
