import React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-[rgba(255,255,255,0.38)] shadow-[0_18px_60px_rgba(18,18,18,0.06)] backdrop-blur-[3px]",
        className
      )}
    >
      {children}
    </div>
  );
}
