import { useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import type { PlayerRow } from '../types/player';
import { GlassPanel } from './ui/GlassPanel';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Props = {
  open: boolean;
  player: PlayerRow | null;
  onClose: () => void;
};

function formatPct(v: number) {
  if (!Number.isFinite(v)) return '—';
  return `${Math.round(v * 1000) / 10}%`;
}

function getChartColors() {
  if (typeof window === 'undefined') return { accent: '#3b82f6', muted: '#475569' };
  const styles = getComputedStyle(document.documentElement);
  return {
    accent: `rgb(${styles.getPropertyValue('--accent').trim()})`,
    muted: `rgb(${styles.getPropertyValue('--muted').trim()})`,
  };
}

function GlassTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel p-3">
      <p className="text-xs font-semibold text-[rgb(var(--muted))]">{label}</p>
      <div className="mt-1 text-sm font-semibold">{payload[0]?.value}</div>
    </div>
  );
}

/**
 * PlayerModal
 * -----------
 * A lightweight, glassy modal with player details.
 *
 * v0 uses a placeholder chart (derived from the current rating) until we add match history.
 *
 * Design goals:
 * - Strong separation from the calm background (shadow + border + blur)
 * - Works in light/dark
 * - Minimal and readable (acts as living documentation)
 */
export function PlayerModal({ open, player, onClose }: Props) {
  const colors = getChartColors();

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const data = useMemo(() => {
    if (!player) return [];
    const base = Math.round(player.rating || 0);
    // Placeholder time series: small wave around rating.
    return Array.from({ length: 12 }, (_, i) => {
      const t = i / 11;
      const wave = Math.sin(t * Math.PI * 2) * 18;
      return {
        label: `T-${11 - i}`,
        rating: Math.round(base + wave + (t - 0.5) * 8),
      };
    });
  }, [player]);

  if (!open || !player) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default bg-[rgba(0,0,0,0.35)] backdrop-blur-sm"
        onClick={onClose}
        aria-label="Zavřít detail hráče"
      />

      <div className="relative mx-auto flex h-full max-w-3xl items-center px-4">
        <GlassPanel className="w-full p-6 md:p-7" hover>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-wider text-[rgb(var(--muted))]">Detail hráče</p>
              <h3 className="mt-1 text-2xl font-extrabold tracking-tight">{player.name}</h3>
              <p className="mt-2 text-sm text-[rgb(var(--muted))]">
                Aktuální rating: <span className="font-semibold text-[rgb(var(--text))]">{Math.round(player.rating)}</span> • Peak:{' '}
                <span className="font-semibold text-[rgb(var(--text))]">{Math.round(player.peak)}</span> • Winrate:{' '}
                <span className="font-semibold text-[rgb(var(--text))]">{formatPct(player.winrate)}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="glass-chip p-2 shadow-soft transition hover:translate-y-[-1px]"
              aria-label="Zavřít"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <Stat label="WIN" value={player.win} />
            <Stat label="LOSS" value={player.loss} />
            <Stat label="DRAW" value={player.draw} />
            <Stat label="GAMES" value={player.games} />
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">Graf vývoje (placeholder)</p>
              <span className="text-xs text-[rgb(var(--muted))]">v1: napojíme match historii</span>
            </div>
            <div className="glass-panel p-4">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <defs>
                      <filter id="pmGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <XAxis dataKey="label" tick={{ fill: colors.muted, fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: colors.muted, fontSize: 12 }} tickLine={false} axisLine={false} width={42} />
                    <Tooltip content={<GlassTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="rating"
                      stroke={colors.accent}
                      strokeWidth={2.5}
                      dot={false}
                      filter="url(#pmGlow)"
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-chip px-4 py-3 shadow-soft">
      <div className="text-[11px] font-semibold tracking-wider text-[rgb(var(--muted))]">{label}</div>
      <div className="mt-1 text-lg font-extrabold tracking-tight">{value}</div>
    </div>
  );
}
