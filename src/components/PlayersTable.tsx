import { useEffect, useMemo, useState } from "react";
import { fetchPlayersFromSheets, type PlayerRow } from "../lib/googleSheets";
import { formatInt, formatPct } from "../lib/format";

type Props = {
  sortKey: "rating" | "games" | "winrate" | "peak" | "name";
  query: string;
};

type LoadState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; players: PlayerRow[] };

export function PlayersTable({ sortKey, query }: Props) {
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const players = await fetchPlayersFromSheets();
        if (cancelled) return;
        setState({ kind: "ready", players });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        if (cancelled) return;
        setState({ kind: "error", message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => {
    if (state.kind !== "ready") return [];

    const q = query.trim().toLowerCase();
    const filtered = q
      ? state.players.filter((p) => p.name.toLowerCase().includes(q))
      : state.players;

    const sorted = [...filtered].sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name, "cs");
      return (b as any)[sortKey] - (a as any)[sortKey];
    });

    return sorted;
  }, [state, sortKey, query]);

  if (state.kind === "loading") {
    return <SkeletonTable />;
  }

  if (state.kind === "error") {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="text-sm font-semibold text-[var(--danger)]">Nepodařilo se načíst data</div>
        <div className="mt-1 text-sm text-[var(--muted)]">{state.message}</div>
        <div className="mt-3 text-xs text-[var(--muted)]">
          Tip: zkontroluj, že sheet je veřejně čitelný (nebo použij „Publish to web“).
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-[var(--surface2)] text-[var(--muted)]">
          <tr>
            <Th>#</Th>
            <Th>Jméno</Th>
            <Th>Rating</Th>
            <Th>Games</Th>
            <Th>W</Th>
            <Th>L</Th>
            <Th>D</Th>
            <Th>Winrate</Th>
            <Th>Peak</Th>
          </tr>
        </thead>

        <tbody>
          {rows.map((p, i) => (
            <tr
              key={`${p.name}-${i}`}
              className="border-t border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
            >
              <Td className="text-[var(--muted)]">{i + 1}</Td>
              <Td className="font-semibold">{p.name}</Td>
              <Td>{formatInt(p.rating)}</Td>
              <Td>{formatInt(p.games)}</Td>
              <Td>{formatInt(p.win)}</Td>
              <Td>{formatInt(p.loss)}</Td>
              <Td>{formatInt(p.draw)}</Td>
              <Td>{formatPct(p.winrate)}</Td>
              <Td>{formatInt(p.peak)}</Td>
            </tr>
          ))}
        </tbody>
      </table>

      {rows.length === 0 ? (
        <div className="border-t border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
          Žádní hráči k zobrazení (zkus změnit filtr).
        </div>
      ) : null}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 font-semibold">{children}</th>;
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={["px-3 py-2", className ?? ""].join(" ")}>{children}</td>;
}

function SkeletonTable() {
  return (
    <div className="grid gap-3">
      <div className="h-10 w-full animate-pulse rounded-2xl bg-[var(--surface2)]" />
      <div className="h-10 w-full animate-pulse rounded-2xl bg-[var(--surface2)]" />
      <div className="h-10 w-full animate-pulse rounded-2xl bg-[var(--surface2)]" />
      <div className="h-10 w-full animate-pulse rounded-2xl bg-[var(--surface2)]" />
    </div>
  );
}
