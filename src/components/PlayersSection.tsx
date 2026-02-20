import { useMemo, useState } from "react";
import { Section } from "./Section";
import { PlayersTable } from "./PlayersTable";

type SortKey = "rating" | "games" | "winrate" | "peak" | "name";

export function PlayersSection() {
  const [sortKey, setSortKey] = useState<SortKey>("rating");
  const [query, setQuery] = useState("");

  const right = useMemo(
    () => (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Hledat hráče…"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none placeholder:text-[var(--muted)] focus:ring-2 focus:ring-[var(--ring)] sm:w-56"
        />

        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          <option value="rating">Řadit: Rating</option>
          <option value="games">Řadit: Games</option>
          <option value="winrate">Řadit: Winrate</option>
          <option value="peak">Řadit: Peak</option>
          <option value="name">Řadit: Jméno</option>
        </select>
      </div>
    ),
    [sortKey, query],
  );

  return (
    <div id="players">
      <Section
        title="Hráči"
        subtitle="Data se načítají z Google Sheets (Elo standings)."
        right={right}
      >
        <PlayersTable sortKey={sortKey} query={query} />
      </Section>
    </div>
  );
}
