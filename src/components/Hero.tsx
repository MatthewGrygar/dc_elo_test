"use client";

import React from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { profile, i18n, type Lang, t } from "@/data/site";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function Hero({ lang }: { lang: Lang }) {
  const { scrollY } = useScroll();
  // Hero transforms
  const titleScale = useTransform(scrollY, [0, 220], [1, 0.86]);
  const titleY = useTransform(scrollY, [0, 220], [0, -12]);
  const photoY = useTransform(scrollY, [0, 220], [0, -28]);
  const photoScale = useTransform(scrollY, [0, 220], [1, 0.92]);
  const sigOpacity = useTransform(scrollY, [0, 220], [0.55, 0.14]);

  return (
    <section id="home" className="relative overflow-hidden pt-28 md:pt-32">
      {/* Spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(184,155,115,0.28),rgba(184,155,115,0)_62%)] blur-2xl"
      />
      {/* Decorative lines */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.55]">
        <div className="absolute left-6 top-28 h-[220px] w-[220px] rounded-full border border-border" />
        <div className="absolute right-10 top-48 h-[120px] w-[120px] rounded-full border border-border" />
        <div className="absolute bottom-12 left-1/2 h-[180px] w-[540px] -translate-x-1/2 rounded-full border border-border" />
      </div>

      <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 pb-20 md:grid-cols-12 md:pb-28">
        {/* Left */}
        <div className="relative z-10 md:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
            className="inline-flex items-center gap-3"
          >
            <Badge>{t(i18n.hero.kicker, lang)}</Badge>
            <span className="hidden text-xs text-ink3 md:inline">
              {t(profile.location, lang)}
            </span>
          </motion.div>

          <motion.h1
            style={{ scale: titleScale, y: titleY }}
            className="mt-7 text-[clamp(44px,6vw,76px)] font-semibold leading-[0.96] tracking-tightish"
          >
            {profile.name}
          </motion.h1>

          <div className="relative mt-3">
            <motion.div
              style={{ opacity: sigOpacity }}
              className="pointer-events-none absolute -top-10 left-0 font-signature text-[64px] leading-none text-[rgba(18,18,18,0.35)] md:-top-12 md:text-[84px]"
              aria-hidden
            >
              Matthew Grygar
            </motion.div>

            <p className="relative z-10 mt-4 max-w-[52ch] text-base leading-relaxed text-ink2 md:text-lg">
              {t(i18n.hero.title, lang)}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Badge>{t(i18n.hero.subtitle, lang)}</Badge>
              <Badge>Support / System Engineering</Badge>
              <Badge>IAM / IdM</Badge>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button
                href="#contact"
                onClick={(e: any) => {
                  e.preventDefault();
                  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {t(i18n.hero.primaryCta, lang)} <ArrowUpRight className="h-4 w-4" />
              </Button>
              <Button variant="secondary" href={profile.cvUrl} target="_blank" rel="noreferrer">
                {t(i18n.hero.secondaryCta, lang)}
              </Button>
            </div>
          </div>

          <div className="mt-14 flex items-center gap-3 text-xs text-ink3">
            <ArrowDown className="h-4 w-4" />
            <span>{lang === "en" ? "Scroll to explore" : "Scroll pro pokračování"}</span>
          </div>
        </div>

        {/* Right photo */}
        <div className="relative md:col-span-5">
          <motion.div style={{ y: photoY, scale: photoScale }} className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 rounded-[32px] bg-[radial-gradient(ellipse_at_top,rgba(184,155,115,0.26),rgba(184,155,115,0)_60%)] blur-xl"
            />
            <div className="relative overflow-hidden rounded-[32px] border border-border bg-[rgba(255,255,255,0.28)] shadow-lift">
              <Image
                src="/profile.png"
                alt="Matthew portrait"
                width={900}
                height={1100}
                priority
                className="h-[520px] w-full object-cover object-[50%_18%] md:h-[620px]"
              />
              {/* Soft vignette */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_45%,rgba(0,0,0,0.22))]"
              />
            </div>

            {/* Tiny caption */}
            <div className="mt-4 flex items-center justify-between text-xs text-ink3">
              <span>{lang === "en" ? "System engineering / support / identity" : "System engineering / support / identity"}</span>
              <span className="font-signature text-base text-[rgba(18,18,18,0.38)]">mg</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
