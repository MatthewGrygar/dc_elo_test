"use client";
import { useState, useEffect } from "react";

export type BP = "xs" | "sm" | "md" | "lg" | "xl";
export interface WinSize { w: number; h: number; wBp: BP; hBp: BP; full: boolean; }

function bp(v: number, cuts: number[]): BP {
  const names: BP[] = ["xs","sm","md","lg","xl"];
  for (let i = 0; i < cuts.length; i++) if (v < cuts[i]) return names[i];
  return "xl";
}

export function useWinSize(): WinSize {
  const calc = (): WinSize => {
    const w = typeof window !== "undefined" ? window.innerWidth  : 1440;
    const h = typeof window !== "undefined" ? window.innerHeight : 900;
    return { w, h,
      wBp: bp(w, [640, 1024, 1280, 1600]),
      hBp: bp(h, [620, 720, 820, 960]),
      full: w >= 1024 && h >= 760,
    };
  };
  const [s, setS] = useState<WinSize>(calc);
  useEffect(() => {
    const upd = () => setS(calc());
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, []);
  return s;
}
