import type { ReactNode } from "react";

type SectionProps = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
};

export function Section({ title, subtitle, right, children }: SectionProps) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-soft">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p> : null}
        </div>
        {right ? <div className="md:pb-0.5">{right}</div> : null}
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}
