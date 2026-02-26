"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Dot, Shield, Wrench, Gauge } from "lucide-react";
import { i18n, type Lang, t } from "@/data/site";
import { Reveal, RevealGroup } from "@/components/motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

function IconFor(tags: string[]) {
  if (tags.includes("IdM") || tags.includes("IAM") || tags.includes("iam")) return <Shield className="h-4 w-4" />;
  if (tags.includes("Monitoring") || tags.includes("monitoring")) return <Gauge className="h-4 w-4" />;
  return <Wrench className="h-4 w-4" />;
}

export function Experience({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="experience" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tightish md:text-4xl">
            {t(i18n.experience.headline, lang)}
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-5">
          {i18n.experience.items.map((job, idx) => {
            const isOpen = open === idx;
            const tags = job.tags;

            return (
              <Card key={idx} className="p-0">
                <button
                  onClick={() => setOpen(isOpen ? null : idx)}
                  className="group flex w-full items-center justify-between gap-6 rounded-3xl p-7 text-left transition hover:bg-[rgba(18,18,18,0.02)]"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-[rgba(255,255,255,0.45)] text-ink2">
                      {IconFor(tags)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="text-lg font-semibold text-ink">{t(job.role, lang)}</span>
                        <span className="text-sm text-ink3">— {job.company}</span>
                        <span className="text-xs text-ink3">{t(job.period, lang)}</span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {tags.map((tg) => (
                          <Badge key={tg}>{tg}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-ink3 transition-transform duration-300",
                      isOpen ? "rotate-180" : "rotate-0",
                      "group-hover:text-ink2"
                    )}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.38, ease: [0.2, 0.8, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="grid gap-6 border-t border-border px-7 pb-7 pt-6 md:grid-cols-12">
                        <RevealGroup className="grid gap-3 md:col-span-8">
                          {(job.bullets as any)[lang].map((b: string, i: number) => (
                            <Reveal key={i} className="flex items-start gap-3">
                              <Dot className="mt-1 h-5 w-5 text-[rgba(184,155,115,0.8)]" />
                              <p className="text-sm leading-relaxed text-ink2">{b}</p>
                            </Reveal>
                          ))}
                        </RevealGroup>

                        <div className="md:col-span-4">
                          <div className="text-xs font-medium text-ink2">
                            {lang === "en" ? "Impact" : "Dopad"}
                          </div>
                          <div className="mt-3 grid gap-2">
                            {(job.impacts as any)[lang].map((imp: string, i: number) => (
                              <div
                                key={i}
                                className="rounded-2xl border border-border bg-[rgba(255,255,255,0.42)] p-4 text-sm text-ink2"
                              >
                                {imp}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
