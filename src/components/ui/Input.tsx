import React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-2xl border border-border bg-[rgba(255,255,255,0.55)] px-4 text-sm text-ink placeholder:text-ink3 shadow-[0_10px_35px_rgba(18,18,18,0.05)] transition focus:border-[rgba(184,155,115,0.55)]",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
