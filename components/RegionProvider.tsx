"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Region = "FR" | "CZ" | "ALL";

interface RegionContextType {
  region: Region;
  setRegion: (r: Region) => void;
}

const RegionContext = createContext<RegionContextType>({ region: "ALL", setRegion: () => {} });

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [region, setRegionState] = useState<Region>("ALL");

  useEffect(() => {
    try {
      const s = localStorage.getItem("dc-elo-region") as Region | null;
      if (s && ["FR", "CZ", "ALL"].includes(s)) setRegionState(s);
    } catch {}
  }, []);

  const setRegion = (r: Region) => {
    setRegionState(r);
    try { localStorage.setItem("dc-elo-region", r); } catch {}
  };

  return (
    <RegionContext.Provider value={{ region, setRegion }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() { return useContext(RegionContext); }
