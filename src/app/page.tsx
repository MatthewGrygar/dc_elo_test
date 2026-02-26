"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Experience } from "@/components/Experience";
import { Projects } from "@/components/Projects";
import { Skills } from "@/components/Skills";
import { Testimonials } from "@/components/Testimonials";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { BackToTop, CustomCursor } from "@/components/Enhancers";
import type { Lang } from "@/data/site";

export default function Page() {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("lang");
    if (saved === "cs" || saved === "en") setLang(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <main className="noise relative min-h-screen">
      <CustomCursor />
      <Navbar lang={lang} setLang={setLang} />
      <Hero lang={lang} />
      <About lang={lang} />
      <Experience lang={lang} />
      <Projects lang={lang} />
      <Skills lang={lang} />
      <Testimonials lang={lang} />
      <Contact lang={lang} />
      <Footer />
      <BackToTop />
    </main>
  );
}
