"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function BackToTop() {
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setShow(y > 800));

  return (
    <motion.div
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 10, pointerEvents: show ? "auto" as any : "none" as any }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Button
        variant="secondary"
        size="sm"
        onClick={() => document.getElementById("home")?.scrollIntoView({ behavior: "smooth" })}
        aria-label="Back to top"
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}

export function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer:fine)").matches;
    if (!fine) return;

    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    const onEnter = () => setActive(true);
    const onLeave = () => setActive(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseenter", onEnter);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseenter", onEnter);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      className="cursor-dot"
      style={{
        left: pos.x,
        top: pos.y,
        opacity: active ? 1 : 0
      }}
      aria-hidden
    />
  );
}
