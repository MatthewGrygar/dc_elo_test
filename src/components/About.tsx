"use client";

import React from "react";
import { Check, Sparkles } from "lucide-react";
import { i18n, type Lang, t } from "@/data/site";
import { Reveal, RevealGroup } from "@/components/motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function About({ lang }: { lang: Lang }) {
  return (
    <section id="about" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5">
        <Reveal>
          <div className="flex items-start justify-between gap-6">
            <h2 className="text-3xl font-semibold tracking-tightish md:text-4xl">
              {t(i18n.about.headline, lang)}
            </h2>
            <Badge className="hidden md:inline-flex">
              <Sparkles className="mr-2 h-4 w-4" /> {t(i18n.about.currently.label, lang)}
            </Badge>
          </div>
          <p className="mt-5 max-w-[78ch] text-base leading-relaxed text-ink2 md:text-lg">
            {t(i18n.about.body, lang)}
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-12">
          <Card className="p-7 md:col-span-7">
            <RevealGroup className="grid gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-ink">{t(i18n.about.pillarsTitle, lang)}</h3>
                <span className="text-xs text-ink3">{t(i18n.about.currently.value, lang)}</span>
              </div>
              <div className="grid gap-3">
                {i18n.about.pillars.map((p, idx) => (
                  <Reveal key={idx} className="flex items-start gap-3">
                    <div className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-xl border border-border bg-[rgba(255,255,255,0.45)]">
                      <Check className="h-4 w-4 text-[rgba(184,155,115,0.85)]" />
                    </div>
                    <div className="text-sm leading-relaxed text-ink2">
                      {t(p, lang)}
                    </div>
                  </Reveal>
                ))}
              </div>
            </RevealGroup>
          </Card>

          <Card className="p-7 md:col-span-5">
            <RevealGroup className="grid gap-4">
              <h3 className="text-base font-semibold text-ink">{t(i18n.about.toolboxTitle, lang)}</h3>
              <div className="flex flex-wrap gap-2">
                {i18n.about.toolbox.map((tool) => (
                  <Reveal key={tool}>
                    <Badge>{tool}</Badge>
                  </Reveal>
                ))}
              </div>

              <div className="mt-4 rounded-3xl border border-border bg-[rgba(18,18,18,0.02)] p-5">
                <div className="text-xs text-ink3">{t(i18n.about.currently.label, lang)}</div>
                <div className="mt-1 text-sm font-medium text-ink">
                  {t(i18n.about.currently.value, lang)}
                </div>
                <div className="mt-3 text-xs leading-relaxed text-ink3">
                  {lang === "en"
                    ? "I like clear runbooks, calm incident rooms, and tooling that makes the next week easier."
                    : "Mám rád jasné runbooky, klidný incident room a tooling, který zjednoduší příští týden."}
                </div>
              </div>
            </RevealGroup>
          </Card>
        </div>
      </div>
    </section>
  );
}
