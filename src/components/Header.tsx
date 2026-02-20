import type { Theme } from "../lib/theme";

type HeaderProps = {
  theme: Theme;
  onToggleTheme: () => void;
};

export function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color:var(--bg)]/75 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--surface2)] shadow-[var(--shadow)]"
            aria-hidden
          >
            <span className="text-lg font-black tracking-tight">DC</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-wide text-[var(--muted)]">NEW</div>
            <div className="text-base font-bold">DC ELO 2.0</div>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          className="group inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold shadow-soft transition hover:translate-y-[-1px] hover:bg-[var(--surface2)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          aria-label="Přepnout světlý / tmavý režim"
        >
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: "var(--brand)" }}
            aria-hidden
          />
          <span className="text-[var(--muted)] group-hover:text-[var(--text)]">
            {theme === "dark" ? "Tmavý" : "Světlý"} režim
          </span>
        </button>
      </div>
    </header>
  );
}
