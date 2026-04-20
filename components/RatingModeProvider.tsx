"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type RatingMode = "ELO" | "DCPR";

interface RatingModeContextType {
  mode: RatingMode;
  setMode: (mode: RatingMode) => void;
}

const RatingModeContext = createContext<RatingModeContextType>({
  mode: "ELO",
  setMode: () => {},
});

export function RatingModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<RatingMode>("ELO");

  useEffect(() => {
    try {
      const s = localStorage.getItem("dc-elo-mode") as RatingMode | null;
      if (s && ["ELO", "DCPR"].includes(s)) setModeState(s);
    } catch {}
  }, []);

  const setMode = (m: RatingMode) => {
    setModeState(m);
    try { localStorage.setItem("dc-elo-mode", m); } catch {}
  };

  return (
    <RatingModeContext.Provider value={{ mode, setMode }}>
      {children}
    </RatingModeContext.Provider>
  );
}

export function useRatingMode() {
  return useContext(RatingModeContext);
}
