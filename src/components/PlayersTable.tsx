import { useMemo, useState } from 'react';
import type { PlayerRow } from '../types/player';
import { ArrowDownAZ, ArrowDownWideNarrow, Search } from 'lucide-react';

type SortKey = 'rating' | 'name' | 'games' | 'winrate' | 'peak';

type Props = {
  players: PlayerRow[];
  loading?: boolean;
  error?: string | null;
};

function formatPct(v: number) {
  if (!Number.isFinite(v)) return '—';
  return `${Math.round(v * 1000) / 10}%`;
}

export function PlayersTable({ players, loading, error }: Props) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('rating');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q ? players.filter((p) => p.name.toLowerCase().includes(q)) : players;

    const sorted = [...base].sort((a, b) => {
      switch (sortKey) {
        case 'name':
          return a.name.localeCompare(b.name, 'cs');
        case 'games':
          return b.games - a.games;
        case 'winrate':
          return b.winrate - a.winrate;
        case 'peak':
          return b.peak - a.peak;
        case 'rating':
        default:
          return b.rating - a.rating;
      }
    });

    return sorted;
  }, [players, query, sortKey]);

  return (
    <section className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))]/60 p-5 shadow-soft backdrop-blur">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Hráči</h2>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">
            Data: Google Sheet → list <span className="font-semibold">Elo standings</span>
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative">
            <span className="sr-only">Hledat hráče</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Hledat…"
              className="w-full rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))]/60 py-2 pl-10 pr-3 text-sm shadow-soft outline-none transition focus:border-[rgba(var(--accent),0.7)]"
            />
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSortKey('rating')}
              className={buttonClass(sortKey === 'rating')}
              title="Seřadit podle ratingu"
            >
              <ArrowDownWideNarrow size={16} />
              Rating
            </button>
            <button
              type="button"
              onClick={() => setSortKey('name')}
              className={buttonClass(sortKey === 'name')}
              title="Seřadit podle jména"
            >
              <ArrowDownAZ size={16} />
              Jméno
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[900px] w-full border-separate border-spacing-0">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
              <th className="sticky left-0 z-10 bg-[rgb(var(--panel))] px-3 py-3">#</th>
              <th className="sticky left-10 z-10 bg-[rgb(var(--panel))] px-3 py-3">Hráč</th>
              <th className="px-3 py-3">Rating</th>
              <th className="px-3 py-3">Games</th>
              <th className="px-3 py-3">Win</th>
              <th className="px-3 py-3">Loss</th>
              <th className="px-3 py-3">Draw</th>
              <th className="px-3 py-3">Winrate</th>
              <th className="px-3 py-3">Peak</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-sm text-[rgb(var(--muted))]">
                  Načítám data ze Sheet…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-sm text-[rgb(var(--muted))]">
                  <span className="font-semibold">Nepodařilo se načíst Sheet.</span> Používám demo data.
                  <div className="mt-1 text-xs opacity-80">{error}</div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-sm text-[rgb(var(--muted))]">
                  Žádní hráči pro zadaný filtr.
                </td>
              </tr>
            ) : (
              filtered.map((p, idx) => (
                <tr
                  key={p.name}
                  className="text-sm transition hover:bg-[rgba(var(--accent),0.05)]"
                >
                  <td className="sticky left-0 z-10 border-t border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-3">
                    {idx + 1}
                  </td>
                  <td className="sticky left-10 z-10 border-t border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-3 font-semibold">
                    {p.name}
                  </td>
                  <td className="border-t border-[rgb(var(--border))] px-3 py-3">{Math.round(p.rating)}</td>
                  <td className="border-t border-[rgb(var(--border))] px-3 py-3">{p.games}</td>
                  <td className="border-t border-[rgb(var(--border))] px-3 py-3">{p.win}</td>
                  <td className="border-t border-[rgb(var(--border))] px-3 py-3">{p.loss}</td>
                  <td className="border-t border-[rgb(var(--border))] px-3 py-3">{p.draw}</td>
                  <td className="border-t border-[rgb(var(--border))] px-3 py-3">{formatPct(p.winrate)}</td>
                  <td className="border-t border-[rgb(var(--border))] px-3 py-3">{Math.round(p.peak)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function buttonClass(active: boolean) {
  return [
    'inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold shadow-soft transition',
    active
      ? 'border-[rgba(var(--accent),0.55)] bg-[rgba(var(--accent),0.10)]'
      : 'border-[rgb(var(--border))] bg-[rgb(var(--bg))]/60 hover:translate-y-[-1px]',
  ].join(' ');
}
