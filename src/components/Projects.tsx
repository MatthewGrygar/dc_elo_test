"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, X, Tag } from "lucide-react";
import { i18n, type Lang, t } from "@/data/site";
import { Reveal, RevealGroup, fadeUp, stagger } from "@/components/motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Project = (typeof i18n.projects.items)[number];

export function Projects({ lang }: { lang: Lang }) {
  const [filter, setFilter] = useState<string>("all");
  const [active, setActive] = useState<Project | null>(null);

  const items = useMemo(() => {
    if (filter === "all") return i18n.projects.items;
    return i18n.projects.items.filter((p) => p.tags.includes(filter as any));
  }, [filter]);

  return (
    <section id="projects" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-semibold tracking-tightish md:text-4xl">
                {t(i18n.projects.headline, lang)}
              </h2>
              <p className="mt-3 max-w-[70ch] text-sm leading-relaxed text-ink3">
                {lang === "en"
                  ? "Placeholder case studies for now — designed to feel real. Replace with your actual projects when ready."
                  : "Zatím placeholder case studies — navržené tak, aby působily reálně. Až budeš ready, prohoď za reálné."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {i18n.projects.filters.map((f) => (
                <button
                  key={f.key}
                  className={cn(
                    "rounded-full border border-border px-3 py-1.5 text-xs transition",
                    filter === f.key
                      ? "bg-ink text-bg shadow-soft"
                      : "bg-[rgba(255,255,255,0.35)] text-ink2 hover:-translate-y-0.5 hover:shadow-soft"
                  )}
                  onClick={() => setFilter(f.key)}
                >
                  {t(f, lang)}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <RevealGroup className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((p, idx) => (
            <motion.div key={idx} variants={fadeUp}>
              <Card className="group relative h-full overflow-hidden p-0">
                {/* Hover gradient */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(1200px circle at 20% 20%, rgba(184,155,115,0.30), rgba(184,155,115,0) 45%)"
                  }}
                />
                <div className="relative flex h-full flex-col p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold leading-tight">{p.title}</div>
                      <div className="mt-3 text-sm leading-relaxed text-ink2">
                        {t(p.description, lang)}
                      </div>
                    </div>
                    <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-border bg-[rgba(255,255,255,0.45)] text-ink3 transition group-hover:-translate-y-0.5 group-hover:text-ink2">
                      <Tag className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {p.tags.map((tg) => (
                      <Badge key={tg}>{tg}</Badge>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl border border-border bg-[rgba(255,255,255,0.40)] p-4 text-sm text-ink2">
                    {t(p.highlight, lang)}
                  </div>

                  <div className="mt-6">
                    <Button
                      variant="ghost"
                      className="px-0 text-ink2 hover:bg-transparent"
                      onClick={() => setActive(p)}
                    >
                      {lang === "en" ? "View case" : "Zobrazit case"} <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </RevealGroup>
      </div>

      <ProjectModal lang={lang} project={active} onClose={() => setActive(null)} />
    </section>
  );
}

function ProjectModal({
  lang,
  project,
  onClose
}: {
  lang: Lang;
  project: Project | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-[70] bg-[rgba(18,18,18,0.18)] backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Project case study"
        >
          <motion.div
            initial={{ y: 16, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
            className="mx-auto mt-16 max-w-[860px] overflow-hidden rounded-3xl border border-border bg-bg shadow-lift"
          >
            <div className="flex items-start justify-between gap-6 border-b border-border p-6">
              <div>
                <div className="text-xl font-semibold">{project.title}</div>
                <div className="mt-2 text-sm text-ink2">{t(project.description, lang)}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tags.map((tg) => (
                    <Badge key={tg}>{tg}</Badge>
                  ))}
                </div>
              </div>
              <button
                className="inline-flex items-center justify-center rounded-2xl border border-border bg-[rgba(255,255,255,0.35)] p-2"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 p-6 md:grid-cols-12">
              <div className="md:col-span-7">
                <div className="text-xs font-medium text-ink2">{lang === "en" ? "What it is" : "Co to je"}</div>
                <p className="mt-2 text-sm leading-relaxed text-ink2">
                  {lang === "en"
                    ? "A premium placeholder case study. Replace this text with real context: problem, constraints, approach, and outcome. Keep it concrete and measurable."
                    : "Prémiový placeholder case study. Nahraď text reálným kontextem: problém, omezení, přístup a výsledek. Drž to konkrétní a měřitelné."}
                </p>

                <div className="mt-5 text-xs font-medium text-ink2">{lang === "en" ? "Highlights" : "Highlighty"}</div>
                <ul className="mt-2 grid gap-2 text-sm text-ink2">
                  {[
                    lang === "en" ? "Automation-first workflows" : "Automatizace jako první volba",
                    lang === "en" ? "Runbook-ready operational steps" : "Runbook-ready kroky",
                    lang === "en" ? "Security-aware defaults" : "Bezpečnostní defaulty",
                    lang === "en" ? "Low-noise stakeholder reporting" : "Nízký šum v reportingu"
                  ].map((x) => (
                    <li key={x} className="rounded-2xl border border-border bg-[rgba(255,255,255,0.42)] p-3">
                      {x}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="md:col-span-5">
                <div className="text-xs font-medium text-ink2">{lang === "en" ? "Suggested structure" : "Doporučená struktura"}</div>
                <div className="mt-2 grid gap-2 text-sm text-ink2">
                  {[
                    lang === "en" ? "Problem → impact" : "Problém → dopad",
                    lang === "en" ? "Approach → key decisions" : "Přístup → klíčová rozhodnutí",
                    lang === "en" ? "Tooling / stack" : "Tooling / stack",
                    lang === "en" ? "Outcome → metrics" : "Výsledek → metriky"
                  ].map((x) => (
                    <div key={x} className="rounded-2xl border border-border bg-[rgba(18,18,18,0.02)] p-3">
                      {x}
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-3xl border border-border bg-[rgba(184,155,115,0.12)] p-5">
                  <div className="text-xs font-medium text-ink2">{lang === "en" ? "Next step" : "Další krok"}</div>
                  <div className="mt-1 text-sm text-ink2">{t(project.highlight, lang)}</div>
                  <div className="mt-4">
                    <Button href="#contact" onClick={(e: any) => { e.preventDefault(); onClose(); document.getElementById("contact")?.scrollIntoView({behavior:"smooth"}); }}>
                      {lang === "en" ? "Discuss this" : "Probrat"} <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
