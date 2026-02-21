"use client"
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { side?: "right" | "left" }
>(({ className, children, side = "right", ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 h-full w-[380px] max-w-[92vw] bg-background/90 backdrop-blur-md border-l shadow-glass outline-none",
        side === "right" ? "right-0 top-0" : "left-0 top-0 border-l-0 border-r",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <DialogPrimitive.Title className="font-semibold">Detail hráče</DialogPrimitive.Title>
        <DialogPrimitive.Close className="rounded-md p-2 hover:bg-accent">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </div>
      <div className="p-5">{children}</div>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
SheetContent.displayName = DialogPrimitive.Content.displayName
