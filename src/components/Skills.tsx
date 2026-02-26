"use client";

import React from "react";
import { i18n, type Lang, t } from "@/data/site";
import { Reveal, RevealGroup } from "@/components/motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function Skills({ lang }: { lang: Lang }) {
  return (
    <section id="skills" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tightish md:text-4xl">
            {t(i18n.skills.headline, lang)}
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-12">
          <Card className="p-7 md:col-span-7">
            <RevealGroup className="grid gap-6">
              {i18n.skills.groups.map((g, idx) => (
                <div key={idx}>
                  <div className="text-sm font-semibold text-ink">{t(g.title, lang)}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {g.items.map((s) => (
                      <Reveal key={s}>
                        <Badge className="text-[13px]">{s}</Badge>
                      </Reveal>
                    ))}
                  </div>
                </div>
              ))}
            </RevealGroup>
          </Card>

          <Card className="p-7 md:col-span-5">
            <RevealGroup className="grid gap-3">
              <div className="text-sm font-semibold text-ink">{t(i18n.skills.strengthsTitle, lang)}</div>
              {i18n.skills.strengths.map((s, i) => (
                <Reveal key={i}>
                  <div className="rounded-2xl border border-border bg-[rgba(255,255,255,0.42)] p-4 text-sm leading-relaxed text-ink2">
                    {t(s, lang)}
                  </div>
                </Reveal>
              ))}
              <div className="mt-2 text-xs leading-relaxed text-ink3">
                {lang === "en"
                  ? "I prefer simple, well-instrumented systems with clear ownership — and I iterate until the noise goes down."
                  : "Preferuju jednoduché, dobře měřené systémy s jasným ownershipem — iteruju, dokud hluk neklesne."}
              </div>
            </RevealGroup>
          </Card>
        </div>
      </div>
    </section>
  );
}
