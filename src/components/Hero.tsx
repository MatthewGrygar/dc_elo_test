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
  const photoY = useTransform(scrollY, [0, 240], [0, -36]);
  const photoX = useTransform(scrollY, [0, 240], [0, -110]);
  const photoScale = useTransform(scrollY, [0, 240], [1, 0.9]);
  const frameOpacity = useTransform(scrollY, [80, 220], [0, 1]);
  const frameY = useTransform(scrollY, [80, 220], [22, 0]);
  const sigOpacity = useTransform(scrollY, [0, 220], [0.65, 0.22]);

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
            className="mt-7 text-[clamp(54px,7.2vw,94px)] font-semibold leading-[0.92] tracking-tightish"
          >
            {profile.name}
          </motion.h1>

          <div className="relative mt-3">
            {/* Signature (image) */}
            <motion.div
              style={{ opacity: sigOpacity }}
              className="pointer-events-none absolute -top-7 left-2 h-[74px] w-[360px] -rotate-[12deg] md:-top-10 md:left-4 md:h-[90px] md:w-[440px]"
              aria-hidden
            >
              <Image
                src="/signature.png"
                alt="Signature"
                fill
                sizes="(max-width: 768px) 360px, 440px"
                className="object-contain"
                priority
              />
            </motion.div>

            <p className="relative z-10 mt-4 max-w-[52ch] text-base leading-relaxed text-ink2 md:text-lg">
              {t(i18n.hero.title, lang)}
            </p>

            {/* Highlight line used for the hero-photo morph */}
            <p className="mt-6 max-w-[46ch] text-[clamp(18px,2.1vw,26px)] font-medium leading-snug text-ink">
              {t(i18n.about.headline, lang)}
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
          <motion.div
            style={{ x: photoX, y: photoY, scale: photoScale }}
            className="relative mx-auto max-w-[520px]"
          >
            {/* Spotlight behind */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-10 rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(184,155,115,0.30),rgba(184,155,115,0)_60%)] blur-2xl"
            />

            {/* Bottom semi-circle frame appears on scroll */}
            <motion.div
              aria-hidden
              style={{ opacity: frameOpacity, y: frameY }}
              className="pointer-events-none absolute -bottom-10 left-1/2 h-[58%] w-[118%] -translate-x-1/2 rounded-t-[999px] border border-border bg-[rgba(245,241,232,0.55)] shadow-[0_18px_60px_rgba(18,18,18,0.10)] backdrop-blur"
            />

            {/* Free-floating image (no frame) */}
            <div className="relative">
              <Image
                src="/profile.png"
                alt="Matthew portrait"
                width={980}
                height={1200}
                priority
                className="h-[520px] w-full select-none object-cover object-[50%_18%] [filter:drop-shadow(0_26px_60px_rgba(18,18,18,0.18))] md:h-[620px]"
              />

              {/* Ultra subtle edge/vignette (keeps it premium on beige) */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_40%,rgba(0,0,0,0.14))] opacity-70"
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
