"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import Image from "next/image";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { profile, i18n, type Lang, t } from "@/data/site";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const links = [
  { id: "home", key: "home" },
  { id: "about", key: "about" },
  { id: "experience", key: "experience" },
  { id: "projects", key: "projects" },
  { id: "skills", key: "skills" },
  { id: "contact", key: "contact" }
] as const;

export function Navbar({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const { scrollY, scrollYProgress } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => setScrolled(latest > 64));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  const navItems = useMemo(
    () =>
      links.map((l) => ({
        id: l.id,
        label: t((i18n.nav as any)[l.key], lang)
      })),
    [lang]
  );

  const onNav = (id: string) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* Scroll progress */}
      <motion.div
        className="fixed left-0 top-0 z-50 h-[2px] w-full origin-left bg-[rgba(184,155,115,0.75)]"
        style={{ scaleX: scrollYProgress }}
        aria-hidden
      />
      <header
        className={cn(
          "fixed left-0 right-0 top-0 z-40 transition-all",
          scrolled ? "py-3" : "py-5"
        )}
      >
        <div className="mx-auto max-w-[1200px] px-5">
          <div
            className={cn(
              "relative flex items-center justify-between rounded-3xl border border-border bg-[rgba(245,241,232,0.72)] backdrop-blur-md transition-all",
              scrolled ? "px-4 py-3 shadow-[0_20px_60px_rgba(18,18,18,0.10)]" : "px-5 py-4"
            )}
          >
            <button
              onClick={() => onNav("home")}
              className="group flex items-center gap-3 text-left"
              aria-label="Go to home"
            >
              <div className={cn("relative h-10 w-10 overflow-hidden rounded-2xl border border-border transition-all", scrolled ? "opacity-100" : "opacity-80")}>
                <Image
                  src="/profile.png"
                  alt="Portrait"
                  fill
                  sizes="40px"
                  className="object-cover object-[50%_20%]"
                  priority
                />
              </div>
              <div className="leading-none">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold tracking-tightish text-ink">
                    {profile.name}
                  </span>
                  {scrolled && (
                    <span className="hidden text-xs text-ink3 md:inline">
                      {t(profile.location, lang)}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "block font-signature text-lg text-[rgba(18,18,18,0.45)] transition-opacity",
                    scrolled ? "opacity-100" : "opacity-0 md:opacity-60"
                  )}
                >
                  mg
                </span>
              </div>
            </button>

            <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
              {navItems.map((it) => (
                <button
                  key={it.id}
                  onClick={() => onNav(it.id)}
                  className="link-underline text-sm text-ink2 transition hover:text-ink"
                >
                  {it.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex">
                <Button
                  variant="secondary"
                  size="sm"
                  href="#contact"
                  onClick={(e: any) => {
                    e.preventDefault();
                    onNav("contact");
                  }}
                >
                  {t(i18n.nav.cta, lang)} <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>

              <button
                className="hidden rounded-2xl border border-border bg-[rgba(255,255,255,0.35)] px-3 py-2 text-xs text-ink2 shadow-[0_12px_40px_rgba(18,18,18,0.06)] transition hover:-translate-y-0.5 hover:shadow-soft md:inline-flex"
                onClick={() => setLang(lang === "en" ? "cs" : "en")}
                aria-label="Toggle language"
              >
                {lang === "en" ? "CZ" : "EN"}
              </button>

              <button
                className="inline-flex items-center justify-center rounded-2xl border border-border bg-[rgba(255,255,255,0.35)] p-2 shadow-[0_12px_40px_rgba(18,18,18,0.06)] transition hover:-translate-y-0.5 hover:shadow-soft md:hidden"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <motion.div
        initial={false}
        animate={open ? "open" : "closed"}
        variants={{
          open: { opacity: 1, pointerEvents: "auto" as any },
          closed: { opacity: 0, pointerEvents: "none" as any }
        }}
        className="fixed inset-0 z-[55] bg-[rgba(18,18,18,0.18)] backdrop-blur-sm md:hidden"
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-x-4 top-4 rounded-3xl border border-border bg-bg shadow-lift"
          variants={{
            open: { y: 0, transition: { duration: 0.4 } },
            closed: { y: -14, transition: { duration: 0.25 } }
          }}
        >
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-2xl border border-border">
                <Image
                  src="/profile.png"
                  alt="Portrait"
                  fill
                  sizes="40px"
                  className="object-cover object-[50%_20%]"
                />
              </div>
              <div>
                <div className="text-sm font-semibold">{profile.name}</div>
                <div className="text-xs text-ink3">{t(profile.location, lang)}</div>
              </div>
            </div>
            <button
              className="inline-flex items-center justify-center rounded-2xl border border-border bg-[rgba(255,255,255,0.35)] p-2"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-5 pb-5">
            <div className="flex items-center justify-between">
              <Badge>{t(i18n.hero.subtitle, lang)}</Badge>
              <button
                className="rounded-2xl border border-border bg-[rgba(255,255,255,0.35)] px-3 py-2 text-xs text-ink2"
                onClick={() => setLang(lang === "en" ? "cs" : "en")}
                aria-label="Toggle language"
              >
                {lang === "en" ? "CZ" : "EN"}
              </button>
            </div>

            <div className="mt-6 grid gap-3">
              {navItems.map((it) => (
                <button
                  key={it.id}
                  onClick={() => onNav(it.id)}
                  className="flex items-center justify-between rounded-2xl border border-border bg-[rgba(255,255,255,0.45)] px-4 py-4 text-left text-base font-medium"
                >
                  {it.label}
                  <ArrowUpRight className="h-4 w-4 text-ink3" />
                </button>
              ))}
            </div>

            <div className="mt-5">
              <Button
                className="w-full"
                href="#contact"
                onClick={(e: any) => {
                  e.preventDefault();
                  onNav("contact");
                }}
              >
                {t(i18n.nav.cta, lang)} <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
