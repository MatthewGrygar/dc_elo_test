"use client";

import React from "react";
import { Quote } from "lucide-react";
import { i18n, type Lang, t } from "@/data/site";
import { Reveal, RevealGroup } from "@/components/motion";
import { Card } from "@/components/ui/Card";

export function Testimonials({ lang }: { lang: Lang }) {
  return (
    <section aria-label="Testimonials" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tightish md:text-4xl">
            {t(i18n.testimonials.headline, lang)}
          </h2>
        </Reveal>

        <RevealGroup className="mt-10 grid gap-5 md:grid-cols-2">
          {i18n.testimonials.items.map((q, idx) => (
            <Card key={idx} className="p-7">
              <div className="flex items-start gap-4">
                <div className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-[rgba(255,255,255,0.45)] text-ink3">
                  <Quote className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm leading-relaxed text-ink2">{t(q.quote, lang)}</div>
                  <div className="mt-4 text-xs text-ink3">{q.name}</div>
                </div>
              </div>
            </Card>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
