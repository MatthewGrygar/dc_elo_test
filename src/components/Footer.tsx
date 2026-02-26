"use client";

import React from "react";
import { profile } from "@/data/site";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-border py-10">
      <div className="mx-auto max-w-[1200px] px-5">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="text-xs text-ink3">
            © {year} {profile.name}. All rights reserved.
          </div>
          <div className="font-signature text-2xl text-[rgba(18,18,18,0.20)]">
            Matthew Grygar
          </div>
        </div>
      </div>
    </footer>
  );
}
