"use client";

import React, { createContext, useContext, useState } from "react";

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
  const [mode, setMode] = useState<RatingMode>("ELO");

  return (
    <RatingModeContext.Provider value={{ mode, setMode }}>
      {children}
    </RatingModeContext.Provider>
  );
}

export function useRatingMode() {
  return useContext(RatingModeContext);
}
