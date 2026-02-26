import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props =
  | ({ href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>)
  | ({ href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>);

export function Button({
  className,
  ...props
}: Props & { variant?: "primary" | "secondary" | "ghost"; size?: "sm" | "md" }) {
  const variant = (props as any).variant ?? "primary";
  const size = (props as any).size ?? "md";

  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium tracking-tightish transition-all duration-300 focus-visible:outline-none";
  const sizes = size === "sm" ? "px-4 py-2 text-sm" : "px-5 py-3 text-sm";
  const variants =
    variant === "primary"
      ? "bg-ink text-bg shadow-soft hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0"
      : variant === "secondary"
        ? "bg-transparent text-ink border border-border shadow-[0_14px_50px_rgba(18,18,18,0.06)] hover:-translate-y-0.5 hover:shadow-soft"
        : "bg-transparent text-ink hover:bg-[rgba(18,18,18,0.04)]";

  const cls = cn(base, sizes, variants, className);

  if ("href" in props && props.href) {
    const { href, ...rest } = props as any;
    return (
      <Link href={href} className={cls} {...rest} />
    );
  }

  return <button className={cls} {...(props as any)} />;
}
