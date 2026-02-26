"use client";

import React, { useMemo, useState } from "react";
import { Mail, Linkedin, ArrowUpRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { i18n, profile, type Lang, t } from "@/data/site";
import { Reveal } from "@/components/motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function Contact({ lang }: { lang: Lang }) {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const [sent, setSent] = useState(false);

  const errors = useMemo(() => {
    const e: any = {};
    if (!values.name.trim()) e.name = lang === "en" ? "Please add your name." : "Doplňte jméno.";
    if (!isEmail(values.email)) e.email = lang === "en" ? "Please use a valid email." : "Zadejte platný email.";
    if (values.message.trim().length < 10) e.message = lang === "en" ? "Message is too short." : "Zpráva je moc krátká.";
    return e;
  }, [values, lang]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    if (Object.keys(errors).length) return;
    // demo submit
    setSent(true);
    setTimeout(() => setSent(false), 2500);
    setValues({ name: "", email: "", message: "" });
  };

  return (
    <section id="contact" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tightish md:text-4xl">
            {t(i18n.contact.headline, lang)}
          </h2>
          <p className="mt-4 max-w-[72ch] text-base leading-relaxed text-ink2 md:text-lg">
            {t(i18n.contact.body, lang)}
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-12">
          <Card className="p-7 md:col-span-7">
            <form onSubmit={onSubmit} className="grid gap-4" aria-label="Contact form">
              <div>
                <label className="mb-2 block text-xs font-medium text-ink2">
                  {t(i18n.contact.form.name, lang)}
                </label>
                <Input
                  value={values.name}
                  onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  placeholder={lang === "en" ? "Your name" : "Vaše jméno"}
                  aria-invalid={!!(touched.name && errors.name)}
                />
                {touched.name && errors.name && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-ink3">
                    <AlertTriangle className="h-4 w-4" /> {errors.name}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-ink2">
                  {t(i18n.contact.form.email, lang)}
                </label>
                <Input
                  value={values.email}
                  onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  placeholder="name@company.com"
                  aria-invalid={!!(touched.email && errors.email)}
                />
                {touched.email && errors.email && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-ink3">
                    <AlertTriangle className="h-4 w-4" /> {errors.email}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-ink2">
                  {t(i18n.contact.form.message, lang)}
                </label>
                <Textarea
                  value={values.message}
                  onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
                  onBlur={() => setTouched((t) => ({ ...t, message: true }))}
                  placeholder={lang === "en" ? "What can I help you with?" : "S čím můžu pomoct?"}
                  aria-invalid={!!(touched.message && errors.message)}
                />
                {touched.message && errors.message && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-ink3">
                    <AlertTriangle className="h-4 w-4" /> {errors.message}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs text-ink3">{t(i18n.contact.form.note, lang)}</div>
                <Button type="submit">
                  {t(i18n.contact.form.send, lang)} <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>

              {sent && (
                <div className="mt-2 flex items-center gap-2 text-sm text-ink2">
                  <CheckCircle2 className="h-5 w-5 text-[rgba(184,155,115,0.9)]" />
                  {lang === "en" ? "Message prepared. Use email/LinkedIn to send it." : "Zpráva připravena. Pošlete ji přes email/LinkedIn."}
                </div>
              )}
            </form>
          </Card>

          <Card className="p-7 md:col-span-5">
            <div className="grid gap-3">
              <div className="text-sm font-semibold text-ink">
                {lang === "en" ? "Direct" : "Přímo"}
              </div>

              <a
                href={`mailto:${profile.email}`}
                className="group flex items-center justify-between rounded-2xl border border-border bg-[rgba(255,255,255,0.45)] px-4 py-4 text-sm text-ink2 transition hover:-translate-y-0.5 hover:shadow-soft"
              >
                <span className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4 text-ink3" /> {profile.email}
                </span>
                <ArrowUpRight className="h-4 w-4 text-ink3 transition group-hover:text-ink2" />
              </a>

              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between rounded-2xl border border-border bg-[rgba(255,255,255,0.45)] px-4 py-4 text-sm text-ink2 transition hover:-translate-y-0.5 hover:shadow-soft"
              >
                <span className="inline-flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-ink3" /> LinkedIn
                </span>
                <ArrowUpRight className="h-4 w-4 text-ink3 transition group-hover:text-ink2" />
              </a>

              <div className="mt-5 rounded-3xl border border-border bg-[rgba(18,18,18,0.02)] p-5">
                <div className="text-xs text-ink3">
                  {lang === "en" ? "Tip" : "Tip"}
                </div>
                <div className="mt-1 text-sm leading-relaxed text-ink2">
                  {lang === "en"
                    ? "Replace placeholder email + LinkedIn in src/data/site.ts. Add your real CV to /public/cv.pdf."
                    : "Nahraď placeholder email + LinkedIn v src/data/site.ts. Přidej reálné CV do /public/cv.pdf."}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
