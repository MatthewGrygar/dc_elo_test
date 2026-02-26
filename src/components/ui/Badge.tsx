import React from "react";
import { cn } from "@/lib/utils";

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-[rgba(255,255,255,0.35)] px-3 py-1 text-xs text-ink2 backdrop-blur-[2px]",
        className
      )}
    >
      {children}
    </span>
  );
}
