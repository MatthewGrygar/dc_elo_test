import React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[140px] w-full resize-none rounded-2xl border border-border bg-[rgba(255,255,255,0.55)] p-4 text-sm text-ink placeholder:text-ink3 shadow-[0_10px_35px_rgba(18,18,18,0.05)] transition focus:border-[rgba(184,155,115,0.55)]",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
