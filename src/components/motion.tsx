"use client";

import { motion, useInView } from "framer-motion";
import React, { useRef } from "react";
import { cn } from "@/lib/utils";

export const easeOut = [0.2, 0.8, 0.2, 1] as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: easeOut } }
};

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.10, delayChildren: 0.08 } }
};

export function Reveal({
  children,
  className,
  once = true
}: {
  children: React.ReactNode;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once, margin: "-10% 0px -10% 0px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
    >
      {children}
    </motion.div>
  );
}

export function RevealGroup({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });

  return (
    <motion.div
      ref={ref}
      className={cn("will-change-transform", className)}
      variants={stagger}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
    >
      {children}
    </motion.div>
  );
}
