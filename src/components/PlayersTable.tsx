import { useMemo, useState } from 'react';
import type { PlayerRow } from '../types/player';
import { ArrowDownAZ, ArrowDownWideNarrow, Search } from 'lucide-react';
import { GlassPanel } from './ui/GlassPanel';
import { PlayerModal } from './PlayerModal';

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
  const [selected, setSelected] = useState<PlayerRow | null>(null);
  const [selectedRank, setSelectedRank] = useState<number | null>(null);

  const rankByName = useMemo(() => {
    // Global ranking is always by rating (descending), independent of UI sort/filter.
    const sorted = [...players].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    const map = new Map<string, number>();
    sorted.forEach((p, i) => map.set(p.name, i + 1));
    return map;
  }, [players]);

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
    <>
      <GlassPanel className="p-5" hover>
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
              className="w-full glass-chip py-2 pl-10 pr-3 text-sm shadow-soft outline-none transition focus:border-[rgba(var(--accent),0.7)]"
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
              <th className="sticky left-0 z-10 bg-[rgba(var(--panel),0.35)] backdrop-blur px-3 py-3">#</th>
              <th className="sticky left-10 z-10 bg-[rgba(var(--panel),0.35)] backdrop-blur px-3 py-3">Hráč</th>
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
                  className="player-row cursor-pointer text-sm"
                  onClick={() => {
                    setSelected(p);
                    setSelectedRank(rankByName.get(p.name) ?? null);
                  }}
                  title="Klikni pro detail"
                >
                  <td className="sticky left-0 z-10 border-t border-[rgb(var(--border))] bg-[rgba(var(--panel),0.35)] backdrop-blur px-3 py-3">
                    {idx + 1}
                  </td>
                  <td className="sticky left-10 z-10 border-t border-[rgb(var(--border))] bg-[rgba(var(--panel),0.35)] backdrop-blur px-3 py-3 font-semibold">
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
      </GlassPanel>

      <PlayerModal
        open={!!selected}
        player={selected}
        rank={selectedRank}
        onClose={() => {
          setSelected(null);
          setSelectedRank(null);
        }}
      />
    </>
  );
}

function buttonClass(active: boolean) {
  return [
    'inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold ui-hover',
    active
      ? 'border-[rgba(var(--accent),0.55)] bg-[rgba(var(--accent),0.10)]'
      : 'border-[rgba(var(--border),0.45)] bg-[rgba(var(--panel),0.35)]',
  ].join(' ');
}
